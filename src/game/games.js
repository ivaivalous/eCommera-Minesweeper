var config = require('../config');
var messages = require('../messages');
var validation = require('./gameValidation');
var state = require('./gameStateManager');
var scoring = require('./scoring');
var transfer = require('./gameTransfer');
var grid = require('./grid');

var games = {};
var gameCount = 0;
var hosts = {};


var buildUser = function(userId, userDisplayName) {
    return {
        userId: userId,
        userDisplayName: userDisplayName
    };
};

var buildGameParameters = function(
    roomName, isPublic, maxPlayers, sizeX, sizeY, mineCount) {

    validation.validateRoomName(roomName);
    validation.validateMaxPlayers(maxPlayers);
    validation.validateDimensions(sizeX, sizeY, mineCount);

    return {
        roomName: roomName,
        isPublic: isPublic,
        maxPlayers: maxPlayers,
        sizeX: sizeX,
        sizeY: sizeY,
        mineCount: mineCount
    };
};

var buildGame = function(hostUser, gameParameters) {
    var map = grid.generateMap(
        gameParameters.sizeX, gameParameters.sizeY, gameParameters.mineCount);

    return {
        hostUser: hostUser,
        gameParameters: gameParameters,
        hasStarted: false,
        hasEnded: false,
        gameStartsIn: config.gameBoundaries.defaultGameStartTimeMs,
        thinkTime: config.gameBoundaries.defaultThinkTimeMs,
        difficulty: getGameDifficulty(
            gameParameters.sizeX,
            gameParameters.sizeY,
            gameParameters.mineCount),
        map: map,
        currentPlayerTurn: {
            userId: null,
            thinkTimeLeft: null
        },
        timeControl: {
            created: null,
            started: null,
            lastActed: null,
            finished: null
        },
        players: []
    };
};

var addGame = function(game) {
    if (gameCount > config.gameBoundaries.maxGames ||
            (hosts[game.hostUser.userId] >
                config.gameBoundaries.maxGamesPerHost)) {

        // Prevent taking the server down by hosting too many games
        // Prevent DOS by having one user occupy all game slots

        throw {error: messages.error.maxGameCountReached};
    }

    return createGame(game);
};

var getGame = function(gameId) {
    return games[gameId];
};

var exists = function(gameId) {
    return getGame(gameId) !== undefined;
};

var getGameStatus = function(gameId, userId) {
    var game = getGame(gameId);
    var gameSummary = {};

    if (game === undefined || !isPlaying(gameId, userId)) {
        throw {error: messages.error.statusGetNotAllowed};
    }

    // Update times stored in the game object
    if (!game.hasEnded) {
        // Don't update ended games.
        // This way they will eventually be removed from memory.

        games[gameId] = state.setLastActed(game);
    }

    // Build a smaller data set the user would get
    gameSummary.currentPlayerTurn = game.currentPlayerTurn;
    gameSummary.currentPlayerTurn.isRequestee = (
        game.currentPlayerTurn.userId === userId);

    gameSummary.gameStartsIn = game.gameStartsIn;
    gameSummary.hasStarted = game.hasStarted;
    gameSummary.hasEnded = game.hasEnded;
    gameSummary.canBeStarted = canGameBeStarted(game),
    gameSummary.map = getGameMap(game);
    gameSummary.players = game.players;
    gameSummary.thinkTime = game.thinkTime;
    gameSummary.isHost = userId === game.hostUser.userId;

    return gameSummary;
};

var canGameBeStarted = function(game) {
    return game.players.length >= config.gameBoundaries.minPlayersToStart;
};

var startGame = function(gameId, userId) {
    var game = getGame(gameId);

    if (game === undefined) {
        // Cannot start a non-existent game
        return false;
    }

    // The game can be started under the following conditions:
    // - It exists
    // - The requesting user is the host
    // - The game hasn't been already started
    // - The game's players count is above the min players threshold
    if (validation.canGameBeStarted(game, userId)) {
        game.gameStartsIn = 0;
        games[gameId] = state.setLastActed(game);

        return true;
    }

    return false;
};

var endGame = function(gameId) {
    var game = getGame(gameId);

    // Calculate final game points
    game = scoring.applyDifficultyBonus(game);

    // Save the game and player scores to database
    transfer.transfer(game);

    // Transfer the game to database
    // Deregister the game
    deregisterGame(game.hostUser.userId);
    // Don't delete the game from memory so players
    // can all get its final state and score.
    // As the game will no longer be updated, it will
    // be purged eventually.
};

var makeMove = function(gameId, userId, xPos, yPos) {
    var game = null;
    var openEmptyCellsPriorMove = 0;
    var openEmptyCellsAfterMove = 0;

    try {
        // Prepare the game's state and make sure it is indeed
        // the requestee's turn to make a move.
        game = updateGameToMakeMove(gameId);
        validation.verifyPlayerTurn(game, userId);
    } catch (error) {
        console.log(error);
        return false;
    }

    // Payload to execute if the player lands on a mine.
    var handlePlayerDead = function() {
        game = markPlayerDead(game, userId);
    };

    // Count how many cells have been open before the move was made
    openEmptyCellsPriorMove = grid.countEmptyOpenCells(game.map);
    
    // Make the actual move  
    game.map = grid.makeMove(game.map, xPos, yPos, handlePlayerDead);

    // Count how many cells have been open after the move was made
    openEmptyCellsAfterMove = grid.countEmptyOpenCells(game.map);

    // Give the player a bonus for being quick to play
    game = updatePlayerScore(
        game, userId, game.currentPlayerTurn.thinkTimeLeft);

    // Apply additional scoring
    updatePlayer(game, userId, applyScoringAfterTurn(
        game, xPos, yPos, openEmptyCellsAfterMove - openEmptyCellsPriorMove));

    // Check if the game has ended as a result of the
    // last player's move
    if (game.hasEnded) {
        endGame(gameId);
    } else {
        game = state.nextPlayer(game);
    }

    games[gameId] = game;
    return true;
};

// Apply after-turn player scoring
var applyScoringAfterTurn = function(game, xPos, yPos, numberOfOpenCells) {

    return function(player, playerIndex) {
        if (player.alive && numberOfOpenCells === 0) {
            // The player has stepped on a cell that neighbours mines
            var neighbouring = game.map[yPos][xPos].neighboringMineCount;

            game.players[playerIndex] = scoring.addEmptyCellNeighboursScore(
                player, neighbouring);

        } else if (player.alive) {
            // The player has expanded some empty cells
            game.players[playerIndex] = scoring.addEmptyFieldsExpandedScore(
                player, numberOfOpenCells);
        }
    }
};

// Prior to letting the player make a move,
// update the game to determine who the current player is.
var updateGameToMakeMove = function(gameId) {
    var game = getGame(gameId);

    if (game === undefined || game.hasEnded) {
        throw {};
    }

    // Update the game so it finds out who the current
    // player is
    games[gameId] = state.setLastActed(game);
    return getGame(gameId);
};

// Call after each player's turn to calculate their new score
var updatePlayerScore = function(game, playerId, thinkTimeLeft) {
    for (var i = 0; i < game.players.length; i++) {
        if (game.players[i].id === playerId) {
            game.players[i] = scoring.addTimeScore(
                game.players[i], thinkTimeLeft);
        }
    }

    return game;
};

// Call when a player hits a mine
var markPlayerDead = function(game, playerId) {
    for (var i = 0; i < game.players.length; i++) {
        if (game.players[i].id === playerId) {
            game.players[i].alive = false;

            game.players = scoring.updatePlayersOnMine(
                game.players, playerId);
        }
    }

    return game;    
};

var updateGame = function(gameId, action) {
    action(games[gameId]);
};

// Use for games listing
var getGames = function() {
    var gamesList = [];
    var gameIdsToRemove = [];

    var listGames = function(gameId, game) {
        if (state.inactivityThresholdReached(game)) {
            // The game hasn't been active for a while
            // Add it for removal
            gameIdsToRemove.push({
                gameId: gameId, hostUserId: game.hostUser.userId
            });
        }

        if (game.gameParameters.isPublic && !game.hasStarted) {
            // Private games and games that have already started
            // should not be listed

            gamesList.push({
                id: gameId,
                hostUser: game.hostUser,
                gameParameters: filterGameParameters(game.gameParameters),
                playersCount: game.players.length,
                difficulty: game.difficulty
            });
        }
    };

    iterateGames(listGames);
    removeGames(gameIdsToRemove);
    return gamesList;
};

var iterateGames = function(action) {
    for (var gameId in games) {
        if (games.hasOwnProperty(gameId)) {
            action(gameId, games[gameId]);
        }
    }
};

// Update a game's player by its userId
var updatePlayer = function(game, playerId, action) {
    for (var i = 0; i < game.players.length; i++) {
        if (game.players[i].id === playerId) {
            action(game.players[i], i);
        }
    }
};

// Filter out game parameters that are not meant
// to be viewed by users, such as the number of mines
var filterGameParameters = function(gameParameters) {
    var parameters = gameParameters;
    delete parameters.mineCount;
    return parameters;
};

// Get a text-based description of how hard the game is
var getGameDifficulty = function(x, y, mineCount) {
    var fieldCount = x * y;
    var mineRatio = (mineCount / fieldCount) * 100;
    var difficulties = config.gameBoundaries.difficultyRanges;

    for (var i = 0; i < difficulties.length; i++) {
        if (mineRatio >= difficulties[i].start &&
                mineRatio < difficulties[i].end) {
            return difficulties[i].name;
        }
    }

    return difficulties[0].name;
};

var isPlaying = function(gameId, userId) {
    var game = games[gameId];

    for (var i = 0; i < game.players.length; i++) {
        if (game.players[i].id === userId) {
            return true;
        }
    }

    return false;
};

var hasFreePlayerSlots = function(gameId) {
    var game = games[gameId];

    if (game === undefined) {
        return false;
    }

    return game.players.length < game.gameParameters.maxPlayers;
};

var addPlayer = function(user, gameId) {
    validation.verifyEligibleToJoin(games, gameId, user.userId);

    games[gameId].players.push({
        name: user.userDisplayName,
        id: user.userId,
        alive: true,
        score: 0
    });

    games[gameId] = state.setLastActed(getGame(gameId));
};

var createGame = function(game) {
    var gameId = generateGameId();

    while (isGameIdTaken(gameId)) {
        gameId = generateGameId();
    }

    game = state.setCreated(game);
    games[gameId] = game;

    try {
        addPlayer(game.hostUser, gameId);
    } catch(error) {
        // The user was not eligible to join their own game
        console.log("Failed to add host to the game: " + error);
        delete games[gameId];
        throw error;
    }

    registerGame(game);
    return gameId;
};

// Count the game towards the maximum allowed games count
// Keep track of how many games each player is hosting
var registerGame = function(game) {
    gameCount++;
    var userId = game.hostUser.userId;
    var userHostedGames = hosts[userId];

    if (userHostedGames === undefined) {
        // The user wasn't hosting any games so far
        hosts[userId] = 1;
    } else {
        hosts[userId] += 1;
    }
};

// Delete and deregister games from memory, without saving them to DB
var removeGames = function(gamesToRemove) {
    for (var i = 0; i < gamesToRemove.length; i++) {
        delete games[gamesToRemove[i].gameId];
        deregisterGame(gamesToRemove[i].hostUserId);
    }
};

// Once a game is over, deregister it from the active games list
// Also reduce the number of games hosted by its host user
var deregisterGame = function(hostUserId) {
    gameCount--;
    hosts[hostUserId] -= 1;
};

var generateGameId = function() {
    var text = "";
    var allowed = config.gameBoundaries.allowedGameIdCharacters;

    for (var i = 0; i < config.gameBoundaries.roomIdLength; i++) {
        text += allowed.charAt(Math.floor(Math.random() * allowed.length));
    }

    return text;
};

var isGameIdTaken = function(id) {
    return games[id] !== undefined;
};

var getGameMap = function(game) {
    var map = {};

    map.x = game.gameParameters.sizeX;
    map.y = game.gameParameters.sizeY;
    map.cells = grid.getUserMapRepresentation(game.map);

    return map;
};

exports.buildUser = buildUser;
exports.buildGameParameters = buildGameParameters;
exports.buildGame = buildGame;

exports.addGame = addGame;
exports.getGame = getGame;
exports.exists = exists;
exports.getGames = getGames;
exports.updateGame = updateGame;
exports.hasFreePlayerSlots = hasFreePlayerSlots;
exports.getGameStatus = getGameStatus;

exports.addPlayer = addPlayer;
exports.updatePlayer = updatePlayer;
exports.isPlaying = isPlaying;
exports.startGame = startGame;
exports.endGame = endGame;
exports.makeMove = makeMove;

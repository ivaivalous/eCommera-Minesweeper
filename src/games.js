var config = require('./config');
var messages = require('./messages');
var validation = require('./gameValidation');
var timeManager = require('./timeManager');

var games = {};
var gameCount = 0;
var hosts = {};


var buildUser = function(userId, userDisplayName) {
    return {
        userId: userId,
        userDisplayName: userDisplayName
    }
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
    }
}

var buildGame = function(hostUser, gameParameters) {
    return {
        hostUser: hostUser,
        gameParameters: gameParameters,
        hasStarted: false,
        gameStartsIn: config.gameBoundaries.defaultGameStartTimeMs,
        thinkTime: config.gameBoundaries.defaultThinkTimeMs,
        difficulty: getGameDifficulty(
            gameParameters.sizeX,
            gameParameters.sizeY,
            gameParameters.mineCount),
        map: {},
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
    }
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

var getGameStatus = function(gameId, userId) {
    var game = getGame(gameId);
    var gameSummary = {};

    if (game === undefined || !isPlaying(gameId, userId)) {
        throw {error: messages.error.statusGetNotAllowed};
    }

    // Update times stored in the game object
    games[gameId] = timeManager.setLastActed(game);

    // Build a smaller data set the user would get
    gameSummary.currentPlayerTurn = game.currentPlayerTurn;
    gameSummary.gameStartsIn = game.gameStartsIn;
    gameSummary.hasStarted = game.hasStarted;
    gameSummary.canBeStarted = canGameBeStarted(game),
    gameSummary.map = getPublicMap(game.map);
    gameSummary.players = game.players;
    gameSummary.thinkTime = game.thinkTime;
    gameSummary.isHost = userId === game.hostUser.userId;

    return gameSummary;
}

var canGameBeStarted = function(game) {
    return game.players.length >= config.gameBoundaries.minPlayersToStart;
}

var startGame = function(gameId, userId) {
    var game = getGame(gameId);
    var minPlayers = config.gameBoundaries.minPlayersToStart;

    if (game === undefined) {
        // Cannot start a non-existent game
        return false;
    }

    // The game can be started under the following conditions:
    // - It exists
    // - The requesting user is the host
    // - The game hasn't been already started
    // - The game's players count is above the min players threshold
    if (game.hostUser.userId === userId &&
            !game.hasStarted &&
                game.players.length >= minPlayers) {

        game.gameStartsIn = 0;
        games[gameId] = timeManager.setLastActed(game);

        return true;
    }

    return false;
}

var makeMove = function(gameId, userId, x, y) {
    var game = getGame(gameId);

    if (game === undefined) {
        return false;
    } else {
        // Update the game so it finds out who the current
        // player is
        games[gameId] = timeManager.setLastActed(game);
        var game = getGame(gameId);
    }

    // Check if it is userId's turn
    if (game.currentPlayerTurn.userId === userId) {
        // TODO the actual move is done here: see gameController
        games[gameId] = timeManager.nextPlayer(game);
        return true;
    } else {
        // Not this player's turn
        return false;
    }
}

var updateGame = function(gameId, action) {
    action(games[gameId]);
};

var getGames = function(includePrivate) {
    var gamesList = [];
    var gameIdsToRemove = [];

    for (var gameId in games) {
        if (games.hasOwnProperty(gameId) &&
            !games[gameId].hasStarted) {

            var game = games[gameId];

            if (timeManager.inactivityThresholdReached(game)) {
                // The game hasn't been active for a while
                // Add it for removal
                gameIdsToRemove.push({
                    gameId: gameId, hostUserId: game.hostUser.id
                });
            }

            if (!game.gameParameters.isPublic && !includePrivate) {
                continue;
            }

            delete game.gameParameters.mineCount;

            gamesList.push({
                id: gameId,
                hostUser: game.hostUser,
                gameParameters: game.gameParameters,
                playersCount: game.players.length,
                difficulty: game.difficulty
            });
        }
    }

    removeGames(gameIdsToRemove);
    return gamesList;
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
}

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
}

var addPlayer = function(user, gameId) {
    validation.verifyEligibleToJoin(games, gameId, user.userId);

    games[gameId].players.push({
        name: user.userDisplayName,
        id: user.userId,
        alive: true,
        score: 0
    })

    games[gameId] = timeManager.setLastActed(getGame(gameId));
};

var createGame = function(game) {
    var gameId = generateGameId();

    while (isGameIdTaken(gameId)) {
        gameId = generateGameId();
    }

    game = timeManager.setCreated(game);
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

    if (userHostedGames == undefined) {
        // The user wasn't hosting any games so far
        hosts[userId] = 1;
    } else {
        hosts[userId] += 1;
    }
}

// Delete and deregister games from memory, without saving them to DB
var removeGames = function(gamesToRemove) {
    for (var i = 0; i < gamesToRemove.length; i++) {
        delete games[gamesToRemove[i].gameId];
        deregisterGame(gamesToRemove[i].hostUserId);
    }
}

// Once a game is over, deregister it from the active games list
// Also reduce the number of games hosted by its host user
var deregisterGame = function(hostUserId) {
    gameCount--;
    hosts[hostUserId] -= 1;
}

var generateGameId = function() {
    var text = "";
    var allowed = config.gameBoundaries.allowedGameIdCharacters;

    for (var i = 0; i < config.gameBoundaries.roomIdLength; i++) {
        text += allowed.charAt(Math.floor(Math.random() * allowed.length));
    }

    return text;
};

var isGameIdTaken = function(id) {
    return games[id] != undefined;
};

var getPublicMap = function(map) {
    return map;
}

exports.buildUser = buildUser;
exports.buildGameParameters = buildGameParameters;
exports.buildGame = buildGame;

exports.addGame = addGame;
exports.getGame = getGame;
exports.getGames = getGames;
exports.updateGame = updateGame;
exports.hasFreePlayerSlots = hasFreePlayerSlots;
exports.getGameStatus = getGameStatus;

exports.addPlayer = addPlayer;
exports.isPlaying = isPlaying;
exports.startGame = startGame;
exports.makeMove = makeMove;

var config = require('./config');
var games = {};
var gameCount = 0;
var hosts = {};

exports.buildUser = function(userId, userDisplayName) {
    return {
        userId: userId,
        userDisplayName: userDisplayName
    }
};

exports.buildGameParameters = function(
    roomName, isPublic, maxPlayers, sizeX, sizeY, mineCount) {

    validateRoomName(roomName);
    validateMaxPlayers(maxPlayers);
    validateDimensions(sizeX, sizeY, mineCount);

    return {
        roomName: roomName,
        isPublic: isPublic,
        maxPlayers: maxPlayers,
        sizeX: sizeX,
        sizeY: sizeY,
        mineCount: mineCount
    }
}

exports.buildGame = function(hostUser, gameParameters) {
    return {
        hostUser: hostUser,
        gameParameters: gameParameters,
        hasStarted: false,
        gameStartsIn: config.gameBoundaries.defaultGameStartTimeMs,
        thinkTime: config.gameBoundaries.defaultThinkTimeMs,
        map: {},
        currentPlayerTurn: {
            userId: null,
            thinkTimeLeft: null
        },
        players: []
    }
};

exports.addGame = function(game) {
    if (gameCount > config.gameBoundaries.maxGames ||
            (hosts[game.hostUser.userId] >
                config.gameBoundaries.maxGamesPerHost)) {

        // Prevent taking the server down by hosting too many games
        // Prevent DOS by having one user occupy all game slots

        throw {error: "Max games count reached"};
    }

    return createGame(game);
};

exports.getGame = function(gameId) {
    return games[gameId];
};

exports.updateGame = function(gameId, action) {
    action(games[gameId]);
};

exports.getGames = function(includePrivate) {
    var gamesList = [];

    for (var property in games) {
        if (games.hasOwnProperty(property) &&
            !games[property].hasStarted) {

            var game = games[property];

            if (!game.gameParameters.isPublic && !includePrivate) {
                continue;
            }

            delete game.gameParameters.mineCount;

            gamesList.push({
                id: property,
                hostUser: game.hostUser,
                gameParameters: game.gameParameters,
                playersCount: game.players.length
            });
        }
    }

    return gamesList;
};

var createGame = function(game) {
    var gameId = generateGameId();

    while (isGameIdTaken(gameId)) {
        gameId = generateGameId();
    }

    games[gameId] = game;

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

// Once a game is over, deregister it from the active games list
// Also reduce the number of games hosted by its host user
var deregisterGame = function(game) {
    gameCount--;
    hosts[game.hostUser.userId] -= 1;
}

var generateGameId = function() {
    var text = "";
    var allowed = config.gameBoundaries.allowedGameIdCharacters;

    for (var i = 0; i < 10; i++) {
        text += allowed.charAt(Math.floor(Math.random() * allowed.length));
    }

    return text;
};

var isGameIdTaken = function(id) {
    return games[id] != undefined;
};

var validateRoomName = function(desiredName) {
    var re = config.regex.roomNameValidation;
    if (!re.test(desiredName)) {
        throw {error: "Invalid room name"};
    }
};

var validateDimensions = function(x, y, mineCount) {
    var minX = config.gameBoundaries.x.minX;
    var maxX = config.gameBoundaries.x.maxX;
    var minY = config.gameBoundaries.y.minY;
    var maxY = config.gameBoundaries.y.maxY;

    var maxMinePercent = config.gameBoundaries.minePercentMax;

    if (x < minX || x > maxX) {
        throw {error: "X dimension out of bounds"};
    }

    if (y < minY || y > maxY) {
        throw {error: "Y dimension out of bounds"};
    }

    var fieldCount = x * y;
    var maxAllowedMines = fieldCount * maxMinePercent;

    if (mineCount > maxAllowedMines) {
        throw {error: "Mine count out of bounds"};
    }

    return true;
};

var validateMaxPlayers = function(maxPlayers) {
    if (maxPlayers > config.gameBoundaries.maxPlayerCount) {
        throw {error: "Too many players"}; 
    }
};
var config = require('./config');
var games = {};

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
        gameParameters: gameParameters
    }
}

exports.addGame = function(game) {
    return createGame(game);
}

exports.getGame = function(gameId) {
    return games[gameId];
}

exports.getGames = function(includePrivate) {
    if (includePrivate) {
        return games;
    }

    var publicGames = {};
    for (var property in games) {
        if (games.hasOwnProperty(property) &&
                games[property].gameParameters.isPublic) {

            publicGames[property] = games[property];
        }
    }

    return publicGames;
}

var createGame = function(game) {
    var gameId = generateGameId();

    while (isGameIdTaken(gameId)) {
        gameId = generateGameId();
    }

    games[gameId] = game;
    return gameId;
}

var generateGameId = function() {
    var text = "";
    var allowed = config.gameBoundaries.allowedGameIdCharacters;

    for (var i = 0; i < 10; i++) {
        text += allowed.charAt(Math.floor(Math.random() * allowed.length));
    }

    return text;
}

var isGameIdTaken = function(id) {
    return games[id] != undefined;
}

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
}

var validateMaxPlayers = function(maxPlayers) {
    if (maxPlayers > config.gameBoundaries.maxPlayerCount) {
        throw {error: "Too many players"}; 
    }
}
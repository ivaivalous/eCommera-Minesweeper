var config = require('../config');
var messages = require('../messages');

exports.validateRoomName = function(desiredName) {
    var re = config.regex.roomNameValidation;
    if (!re.test(desiredName)) {
        throw {error: messages.error.badRoomName};
    }
};

exports.validateDimensions = function(x, y, mineCount) {
    var minX = config.gameBoundaries.x.minX;
    var maxX = config.gameBoundaries.x.maxX;
    var minY = config.gameBoundaries.y.minY;
    var maxY = config.gameBoundaries.y.maxY;

    var maxMinePercent = config.gameBoundaries.minePercentMax;

    if (x < minX || x > maxX) {
        throw {error: messages.error.gameGridXDimensionOutOfRange};
    }

    if (y < minY || y > maxY) {
        throw {error: messages.error.gameGridYDimensionOutOfRange};
    }

    var fieldCount = x * y;
    var maxAllowedMines = fieldCount * maxMinePercent;

    if (mineCount < 1 || mineCount > maxAllowedMines) {
        throw {error: messages.error.gameGridMineCountOutOfRange};
    }

    return true;
};

exports.validateMaxPlayers = function(maxPlayers) {
    if (maxPlayers < 2 || maxPlayers > config.gameBoundaries.maxPlayerCount) {
        throw {error: messages.error.playersNumberOutOfRange}; 
    }
};

exports.verifyEligibleToJoin = function(games, targetGameId, userId) {
    if (games[targetGameId] === undefined ||
            (games[targetGameId].players.length ===
                games[targetGameId].gameParameters.maxPlayers)) {
        // You cannot join a game room that is full
        // or one that does not exist at all

        throw {error: messages.error.gameRoomJoinGeneral};
    }

    if (countGamesParticipating(games, userId) >
            config.gameBoundaries.maxGamesToJoin) {

        // One user can only join a limited number of games
        // at the same time

        throw {error: messages.error.playerInTooManyGames};
    }
};

var countGamesParticipating = function(games, userId) {
    var count = 0;

    for (var key in games) {
       if (games.hasOwnProperty(key)) {
          var game = games[key];

          for (var i = 0; i < game.players.length; i++) {
            if (game.players[i].id === userId) {
                count++;
            }
          }
       }
    }

    return count;
};
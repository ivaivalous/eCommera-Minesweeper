/*
    Validate various aspects of the game -
    whether proposed dimensions are valid, whether there are enough mines
    set up, if a game is join-able and whether a specific player may join it.
*/

"use strict";

var config = require('../config');
var messages = require('../messages');

var validateRoomName = function(desiredName) {
    var re = config.regex.roomNameValidation;
    if (!re.test(desiredName)) {
        throw {error: messages.error.badRoomName};
    }
};

var validateDimensions = function(x, y, mineCount) {


    var maxMinePercent = config.gameBoundaries.minePercentMax;

    validateXDimension(x);
    validateYDimension(y);
    validateMineRatio(x, y, mineCount);
};

function validateXDimension(x) {
    var minX = config.gameBoundaries.x.minX;
    var maxX = config.gameBoundaries.x.maxX;

    if (x < minX || x > maxX) {
        throw {error: messages.error.gameGridXDimensionOutOfRange};
    }
}

function validateYDimension(y) {
    var minY = config.gameBoundaries.y.minY;
    var maxY = config.gameBoundaries.y.maxY;

    if (y < minY || y > maxY) {
        throw {error: messages.error.gameGridYDimensionOutOfRange};
    }
}

function validateMineRatio(x, y, mineCount) {
    var maxMinePercent = config.gameBoundaries.minePercentMax;
    var fieldCount = x * y;
    var maxAllowedMines = fieldCount * maxMinePercent;

    if (mineCount < 1 || mineCount > maxAllowedMines) {
        throw {error: messages.error.gameGridMineCountOutOfRange};
    }
}

var validateMaxPlayers = function(maxPlayers) {
    if (maxPlayers < 2 || maxPlayers > config.gameBoundaries.maxPlayerCount) {
        throw {error: messages.error.playersNumberOutOfRange}; 
    }
};

var verifyEligibleToJoin = function(games, targetGameId, userId) {
    verifyGameJoinable(games[targetGameId]);

    if (countGamesParticipating(games, userId) >
            config.gameBoundaries.maxGamesToJoin) {

        // One user can only join a limited number of games
        // at the same time

        throw {error: messages.error.playerInTooManyGames};
    }
};

// A game is joinable if it exists and the number of users currently joined
// does not exceed the max players configured by the game's host.
var verifyGameJoinable = function(game) {
    if (game === undefined ||
            (game.players.length ===
                game.gameParameters.maxPlayers)) {

        throw {error: messages.error.gameRoomJoinGeneral};
    }
}

var canGameBeStarted = function (game, userId) {
    var minPlayers = config.gameBoundaries.minPlayersToStart;

    return (game.hostUser.userId === userId &&
            !game.hasStarted &&
                game.players.length >= minPlayers);
};

// Count all games a user is participating in
var countGamesParticipating = function(games, userId) {
    var count = 0;

    var countGames = function(game) {
        if (game.hasEnded) {
            // Don't include games that have finished
            return;
        }

        for (var i = 0; i < game.players.length; i++) {
            if (game.players[i].id === userId) {
                count++;
                return;
            }
        }
    };

    iterateGames(games, countGames);
    return count;
};

function iterateGames(games, action) {
    for (var key in games) {
        if (games.hasOwnProperty(key)) {
            var game = games[key];
            action(game);
        }
    }    
}

var verifyPlayerTurn = function(game, playerId) {
    if (game.hasEnded || game.currentPlayerTurn.userId !== playerId) {
        throw {error: "Not this player's turn"};
    }
};

exports.validateRoomName = validateRoomName;
exports.validateDimensions = validateDimensions;
exports.validateMaxPlayers = validateMaxPlayers;
exports.verifyEligibleToJoin = verifyEligibleToJoin;
exports.canGameBeStarted = canGameBeStarted;
exports.verifyGameJoinable = verifyGameJoinable;
exports.verifyPlayerTurn = verifyPlayerTurn;
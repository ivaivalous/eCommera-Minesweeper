/*
    The scoring module determines points awarded to
    each player throughout the game.
*/

"use strict";

var config = require('../config');
var difficulties = {};

// At the end of the game, give out players bonuses
// depending on how difficult the game was.
var applyDifficultyBonus = function(game) {
    var modifier = getDifficultyModifier(game.difficulty);

    for(var i = 0; i < game.players.length; i++) {
        game.players[i].score += roundScore(game.players[i].score * modifier);
    }

    return game;
};

// At each turn, if this player's move was to step on an empty cell,
// award the player points
var addEmptyCellScore = function(player) {
    player.score += config.scoring.stepEmptyCell;
    return player;
};

// At each turn, if this player's move was to step on a cell with at
// least 1 neighboring mine, award the player points proportional
// to the number of neighboring mines.
// If all 8 surrounding cells were mines, the player is really lucky:
// award additional points.
var addEmptyCellNeighboursScore = function(player, mineCount) {
    var maxMines = 8;
    var scoreToAdd = (
        mineCount === maxMines ?
            config.scoring.stepOnNeighboringAll :
            mineCount * config.scoring.stepNeighboringEach);

    player.score += roundScore(scoreToAdd);
    return player;
};

// When a user steps on a mine, the game end for them.
// Apply points (usually a negative amount) to the person's score.
var addSteppedOnMineScore = function(player) {
    player.score += config.scoring.stepMine;
    return player;
};

var updatePlayersOnMine = function(players, playerSteppedOnMineId) {
    var deadPlayersCount = 0;
    var playerIndex = 0;

    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        // Count dead players
        if (!player.isAlive) {
            deadPlayersCount++;
        }

        if (player.id === playerSteppedOnMineId) {
            // This player has just hit the mine
            // Take points away for stepping on a mine
            players[i] = addSteppedOnMineScore(player);
            playerIndex = i;
        }
    }

    if (deadPlayersCount === 1) {
        // This was the first player to step on a mine
        players[playerIndex] = addFirstToStepOnMineScore(
                players[playerIndex]);
    }

    return players;
};

// At each turn, if the user has just clicked an empty cell
// neighbored by other empty cells, empty cells have recursively been
// expanded in all directions until reaching a field neighbored by at
// least 1 mine.
// Award the player some points for each expanded cell. There is a
// limit on points awarded, in order to prevent the creation of large maps
// with small amounts of mines only to get greater points.
var addEmptyFieldsExpandedScore = function(player, expandedFieldsCount) {
    var maxScore = config.scoring.stepPerExpandedMax;
    var scorePerCell = config.scoring.stepPerExpanded;
    var calculatedScore = expandedFieldsCount * scorePerCell;

    var scoreToAdd = maxScore > calculatedScore ? calculatedScore : maxScore; 

    player.score += roundScore(scoreToAdd);
    return player;
};

// At each turn, award players who have made their moves in less time.
// This is also done to discourage users from skipping their turn.
var addTimeScore = function(player, timeLeftMillis) {
    var timeUnit = 10000;
    var unitsLeft = Math.floor(timeLeftMillis / timeUnit);
    var scorePerUnit = config.scoring.timeBonus;

    player.score += roundScore(unitsLeft * scorePerUnit);
    return player;
};

// When a player steps a mine, the game is over for them.
// Being the first player to "die" gives a "special bonus".
var addFirstToStepOnMineScore = function(player) {
    player.score += config.scoring.firstToStepMine;
    return player;
};

// When a player steps a mine, the game is over for them.
// If the player lands on a mine on their first turn, a points
// bonus is applied.
var addSteppedOnMineOnFirstTurnBonus = function(player) {
    player.score += config.scoring.stepOnMineFirstTurn;
    return player;
};

// If all players have "died", award the last one standing
// an additional number of points.
var addLastManStandingBonus = function(player) {
    player.score += config.scoring.lastStanding;
    return player;
};

// At the end of the game, if no mine cells have been open
// and all other cells have, call this to apply the Game Beaten bonus.
var applyGameBeatenBonus = function(game) {
    var bonus = config.scoring.gameBeaten;

    for(var i = 0; i < game.players.length; i++) {
        if (game.players[i].alive) {
            game.players[i].score += roundScore(bonus);
        }
    }

    return game;
};

// The bonus brought by each difficulty setting is stored in config.js.
var getDifficultyModifier = function(difficultySettingName) {
    if (difficulties[difficultySettingName] !== undefined) {
        return difficulties[difficultySettingName];
    }

    for (var i = 0; i < config.gameBoundaries.difficultyRanges.length; i++) {
        var difficulty = config.gameBoundaries.difficultyRanges[i];

        if (difficulty.name === difficultySettingName) {
            // Save to a more convinient local object for future use
            difficulties[difficultySettingName] = difficulty.bonusModifier;

            return difficulty.bonusModifier;
        }
    }

    // Ubknown difficulty setting
    return 1;
};

var roundScore = function(input) {
    return Math.round(input);
};

// Score events to be applied at the end of the game
exports.applyDifficultyBonus = applyDifficultyBonus;

// Score events to be applied after each player's turn
exports.addEmptyCellScore = addEmptyCellScore;
exports.addEmptyCellNeighboursScore = addEmptyCellNeighboursScore;
exports.addSteppedOnMineScore = addSteppedOnMineScore;
exports.addEmptyFieldsExpandedScore = addEmptyFieldsExpandedScore;
exports.addTimeScore = addTimeScore;
exports.updatePlayersOnMine = updatePlayersOnMine;

// Score events to be applied when a certain event happens
exports.addFirstToStepOnMineScore = addFirstToStepOnMineScore;
exports.addSteppedOnMineOnFirstTurnBonus = addSteppedOnMineOnFirstTurnBonus;
exports.addLastManStandingBonus = addLastManStandingBonus;
exports.applyGameBeatenBonus = applyGameBeatenBonus;

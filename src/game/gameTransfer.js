/*
    Transfer a finished game and its players' scores
    to the database.
*/

"use strict";

var db = require('../database');
var queries = require('../queries');

var transfer = function(game) {
    saveGameToDatabase(game);
};

var saveGameToDatabase = function(game) {
    var isPrivate = !game.gameParameters.isPublic;
    var hostUserId = game.hostUser.userId;
    var numberOfPlayers = game.players.length;
    var gameStartTime = game.timeControl.created / 1000;
    var gameEndTime = game.timeControl.finished / 1000;

    var params = [
        isPrivate, hostUserId, numberOfPlayers,
        gameStartTime, gameEndTime
    ];

    db.query(queries.queries.saveGame, params, function (error, result) {
        savePlayersToDatabase(result.insertId, game.players);
    });
};

var savePlayersToDatabase = function(dbGameId, players) {
    for (var i = 0; i < players.length; i++) {
        savePlayerToDatabase(dbGameId, players[i]);
    }
};

var savePlayerToDatabase = function(dbGameId, player) {
    var userId = player.id;
    var score = player.score;
    var params = [userId, dbGameId, score];

    db.query(queries.queries.registerPlayerScore, params, function () {});
};

exports.transfer = transfer;
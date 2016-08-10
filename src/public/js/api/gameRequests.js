(function () {
    'use strict';

    var gameApi = window.gameApi || (window.gameApi = {});

    gameApi.listGames = function(callback, callbackOnError) {
        request.requestGet(['list'], callback, callbackOnError);
    };

    gameApi.createGame = function(
        roomName, boardSizeX, boardSizeY,
        maxPlayers, mineCount, isPublic,
        callback, callbackOnError) {

        request.requestPost(['create'], {
            roomName: roomName,
            boardSizeX: boardSizeX,
            boardSizeY: boardSizeY,
            maxPlayers: maxPlayers,
            mineCount: mineCount,
            isPublic: isPublic ? "true" : "false",
        }, callback, callbackOnError);
    };

    gameApi.joinGame = function(gameId) {

    };

    gameApi.getStatus = function(gameId) {

    };

    gameApi.makeMove = function(gameId, x, y) {

    };
})();
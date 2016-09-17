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

    gameApi.getStatus = function(gameId, callback, callbackOnError) {
        request.requestGet(['', 'status', gameId], callback, callbackOnError);
    };

    gameApi.startGame = function(gameId, callback, callbackOnError) {
        request.requestPost(
            ['', 'start'], {gameId: gameId,}, callback, callbackOnError);
    };

    gameApi.makeMove = function(gameId, x, y, callback, callbackOnError) {
        request.requestPost(['', 'move'], {
            gameId: gameId,
            x: x,
            y: y
        }, callback, callbackOnError);
    };
})();
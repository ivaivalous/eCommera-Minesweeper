var games = require('../games');

// Get a list of all public games
exports.listGames = function(request, response) {
    response.status(200);
    response.json(games.getGames(false));
}

// Create a new game room
exports.createGame = function(request, response) {
    var roomName = request.body.roomName;
    var boardSizeX = request.body.boardSizeX;
    var boardSizeY = request.body.boardSizeY;
    var maxPlayers = request.body.maxPlayers;
    var mineCount = request.body.mineCount;
    var isPublic = request.body.isPublic === "true";

    var userId = "";
    var userDisplayName = "";

    try {
        var user = games.buildUser(userId, userDisplayName);
        var gameParams = games.buildGameParameters(
            roomName, isPublic, maxPlayers,
            boardSizeX, boardSizeY, mineCount);

        var game = games.buildGame(user, gameParams);
        var id = games.addGame(game);

    } catch (err) {
        response.status(400);
        response.json(err);
        return;
    }

    response.status(201);
    response.json({success: true, gameId: id});
}

// Join an existing game
exports.joinGame = function(request, response) {
}

// Get the current status of the game
exports.getStatus = function(request, response) {

}

// Make a move on the game map
exports.makeMove = function(request, response) {

}

exports.setGameMap = function(gameId, map) {
}
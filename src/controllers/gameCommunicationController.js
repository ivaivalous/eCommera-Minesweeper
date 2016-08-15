var games = require('../games');
var messages = require('../messages');


// Get a list of all public games
var listGames = function(request, response) {
    try {
        validateRequest(request);
    } catch (err) {
        response.status(401);
        response.json({error: "Unauthorized"});
        return;
    }

    response.status(200);
    response.json(games.getGames(false));
}

// Create a new game room
var createGame = function(request, response) {
    try {
        validateRequest(request);
    } catch (err) {
        response.status(401);
        response.json({error: "Unauthorized"});
        return;
    }

    var roomName = request.body.roomName;
    var boardSizeX = request.body.boardSizeX;
    var boardSizeY = request.body.boardSizeY;
    var maxPlayers = request.body.maxPlayers;
    var mineCount = request.body.mineCount;
    var isPublic = request.body.isPublic === "true";

    var userId = request.session.userId;
    var userDisplayName = request.session.displayName;

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
var joinGame = function(request, response) {
    var gameId = request.params.gameId;
    var userId = request.session.userId;

    // Verify the user has been authenticated
    try {
        validateRequest(request);
    } catch (err) {
        // TODO show a message you must login before you play
        response.redirect('/login');
        return;
    }

    // Check if the game exists
    if (gameId == undefined || games.getGame(gameId) == undefined) {
        response.viewModel.gameErrorMessage = messages.error.gameUnavailable;
        response.redirect('/dashboard');
        return;
    }

    // Check if the user has already joined the game
    if (games.isPlaying(gameId, userId)) {
        // Don't add her once again, just return her to the game page
        response.render('game/index', response.viewModel);
        return;
    }

    // Check if the game has a free slot for another player
    if (!games.hasFreePlayerSlots(gameId)) {
        response.viewModel.gameErrorMessage = messages.error.gameRoomFull;
        response.redirect('/dashboard');
        return;
    }

    // Add the player to the game
    try {
        games.addPlayer(
            games.buildUser(userId, request.session.displayName),
            gameId
        );

        response.render('game/index', response.viewModel);
    } catch(err) {
        console.log("Error joining game room: " + err);
        response.viewModel.gameErrorMessage = (
            messages.error.gameRoomJoinGeneral);

        response.redirect('/dashboard');
    }
}

// Get the current status of the game
var getStatus = function(request, response) {
    var gameId = request.params.gameId;
    var userId = request.session.userId;

    try {
        validateRequest(request);
    } catch (error) {
        response.status(401);
        response.json({error: 401});
        return;
    }

    try {
        var gameStatus = games.getGameStatus(gameId, userId);
    } catch (error) {
        console.log(error);
        response.status(403);
        response.json(error.responseJSON);
        return;
    }

    response.status(200);
    response.json(gameStatus);
}

// The host can start the game manually
var startGame = function(request, response) {
    var gameId = request.body.gameId;
    var userId = request.session.userId;

    try {
        validateRequest(request);
    } catch (error) {
        response.status(401);
        response.json({error: 401});
        return;
    }

    if (games.startGame(gameId, userId)) {
        response.status(200);
        response.json({success: true});
    } else {
        response.status(500);
        response.json({success: false});
    }
}

// Make a move on the game map
var makeMove = function(request, response) {
    var gameId = request.body.gameId;
    var userId = request.session.userId;
    var x = request.body.x;
    var y = request.body.y;

    try {
        validateRequest(request);
    } catch (error) {
        response.status(401);
        response.json({error: 401});
        return;
    }

    try {
        var sucess = games.makeMove(gameId, userId, x, y);
        response.status(200);
        response.json({success: sucess});
    } catch(error) {
        // Invalid move
        response.status(400);
        response.json({error: messages.error.illegalMove})
    }
}

var setGameMap = function(gameId, map) {
    validateRequest(request);
}

function validateRequest(request) {
    if(!request.session.isUserLogged){
        throw {error: 401};
    }    
}

exports.listGames = listGames;
exports.createGame = createGame;
exports.joinGame = joinGame;
exports.getStatus = getStatus;
exports.makeMove = makeMove;
exports.setGameMap = setGameMap;
exports.startGame = startGame;
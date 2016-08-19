var games = require('../game/games');
var messages = require('../messages');
var validation = require('../game/gameValidation');


// Get a list of all public games
var listGames = function(request, response) {
    response.status(200);
    response.json(games.getGames(false));
};

// Create a new game room
var createGame = function(request, response) {
    try {
        var gameId = buildGame(request);

        response.status(201);
        response.json({success: true, gameId: gameId});
    }
    catch (err) {
        response.status(400);
        response.json(err);
        return;
    }
};

var buildCreateGameParams = function(request) {
    var isPublic = request.body.isPublic === "true";

    return games.buildGameParameters(
        request.body.roomName,
        isPublic,
        request.body.maxPlayers,
        request.body.boardSizeX,
        request.body.boardSizeY,
        request.body.mineCount
    );
};

var buildGame = function(request) {
    var userId = request.session.userId;
    var userDisplayName = request.session.displayName;

    var user = games.buildUser(userId, userDisplayName);
    var gameParams = buildCreateGameParams(request);
    var game = games.buildGame(user, gameParams);

    return games.addGame(game);
};

// Join an existing game
var joinGame = function(request, response) {
    var gameId = request.params.gameId;
    var userId = request.session.userId;

    try {
        validation.verifyGameJoinable(games.getGame(gameId));

        if (!games.isPlaying(gameId, userId)) {
            // If the player isn't in the game already, add her

            games.addPlayer(
                games.buildUser(userId, request.session.displayName),
                gameId
            );
        }

        response.render('game/index', response.viewModel);
    } catch (error) {
        console.log(error);
        response.redirect('/dashboard');
    }
};

// Get the current status of the game
var getStatus = function(request, response) {
    var gameId = request.params.gameId;
    var userId = request.session.userId;
    var gameStatus = null;

    try {
        gameStatus = games.getGameStatus(gameId, userId);
        response.status(200);
        response.json(gameStatus);
    } catch (error) {
        response.status(403);
        response.json(error.responseJSON);
    }
};

// The host can start the game manually
var startGame = function(request, response) {
    var gameId = request.body.gameId;
    var userId = request.session.userId;

    if (games.startGame(gameId, userId)) {
        response.status(200);
        response.json({success: true});
    } else {
        response.status(500);
        response.json({success: false});
    }
};

// Make a move on the game map
var makeMove = function(request, response) {
    var gameId = request.body.gameId;
    var userId = request.session.userId;
    var x = parseInt(request.body.x);
    var y = parseInt(request.body.y);

    try {
        var sucess = games.makeMove(gameId, userId, x, y);
        response.status(200);
        response.json({success: sucess});
    } catch(error) {
        // Invalid move
        console.log(error);
        response.status(400);
        response.json({error: messages.error.illegalMove});
    }
};

var setGameMap = function(gameId, map) {
    validateRequest(request);
};

var validateRequest = function(request) {
    if(!request.session.isUserLogged){
        throw {error: 401};
    }    
};

exports.validateRequest = validateRequest;
exports.listGames = listGames;
exports.createGame = createGame;
exports.joinGame = joinGame;
exports.getStatus = getStatus;
exports.makeMove = makeMove;
exports.setGameMap = setGameMap;
exports.startGame = startGame;
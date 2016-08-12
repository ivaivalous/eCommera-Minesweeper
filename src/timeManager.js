// Time manager controls games in time

var config = require('./config');

var getCurrentTime = function() {
    var date = new Date();
    return date.getTime();
};

var setCreated = function(game) {
    var currentTime = getCurrentTime();
    game.timeControl.created = currentTime;
    game.timeControl.lastActed = currentTime;

    return game;
};

var setLastActed = function(game) {
    var currentTime = getCurrentTime();
    var lastActedTime = game.timeControl.lastActed;
    var timeSinceLastAction = currentTime - lastActedTime;

    // If the game hasn't started, update remaining time
    // or start it if the wait time is over
    if (!game.hasStarted) {
        game = startGame(game);
    } else {
        game = updateGameInProgress(game);
    }

    game.timeControl.lastActed = currentTime;
    return game;
};

var startGame = function(game) {
    var currentTime = getCurrentTime();
    var lastActedTime = game.timeControl.lastActed;
    var timeSinceLastAction = currentTime - lastActedTime;

    if (game.gameStartsIn > timeSinceLastAction) {
        game.gameStartsIn -= timeSinceLastAction;
    } else {
        game.gameStartsIn = 0;

        // Auto-start game
        game.hasStarted = true;
        game.timeControl.started = currentTime;

        // Set current player
        // TODO shuffle players array
        game.currentPlayerTurn.userId = game.players[0].id;
        game.currentPlayerTurn.thinkTimeLeft = game.thinkTime;
    }

    return game;
};

var updateGameInProgress = function(game) {
    var currentTime = getCurrentTime();
    var lastActedTime = game.timeControl.lastActed;
    var timeSinceLastAction = currentTime - lastActedTime;

    // Calculate who's turn it is
    var timeLeft = game.currentPlayerTurn.thinkTimeLeft;

    if (timeLeft > timeSinceLastAction) {
        // It's still the same player's turn
        game.currentPlayerTurn.thinkTimeLeft -= timeSinceLastAction;
    } else {
        // Determine how many players to "jump over"
        var hops = Math.floor(timeSinceLastAction / game.thinkTime) + 1;
        var remainder = timeSinceLastAction % game.thinkTime;
        var newPlayer = getCurrentPlayer(
            game.currentPlayerTurn.userId, game.players, hops);

        game.currentPlayerTurn.userId = newPlayer.id;
        game.currentPlayerTurn.thinkTimeLeft = game.thinkTime - remainder;
    }

    return game;
};

var getCurrentPlayer = function(currentPlayerId, players, hops) {
    var playerIndex = 0;

    for (var i = 0; i < players.length; i++) {
        if (players[i].id === currentPlayerId) {
            playerIndex = i;
            break;
        }
    }

    var targetIndex = playerIndex + hops;
    if (targetIndex < players.length) {
        return players[targetIndex];
    }
    return players[targetIndex % players.length];
};

exports.setCreated = setCreated;
exports.startGame = startGame;
exports.setLastActed = setLastActed;
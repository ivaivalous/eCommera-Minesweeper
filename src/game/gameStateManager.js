/*
    Logic for managing a game's status through time.
    There is no supporting thread to handle games -
    rather, when a player makes a move, the current game state
    is re-calculated.
*/

var config = require('../config');
var grid = require('./grid');
var scoring = require('./scoring');

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

var markGameEnded = function(game) {
    var currentTime = getCurrentTime();
    game.timeControl.finished = currentTime;
    game.hasEnded = true;

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

// Switch the game state to the next living player
var nextPlayer = function(game) {
    game = verifyGameEndConditions(game);

    if (game.hasEnded) {
        return game;
    }

    var newPlayer = getCurrentPlayer(
        game.currentPlayerTurn.userId, game.players, 1);

    game.currentPlayerTurn.userId = newPlayer.id;
    game.currentPlayerTurn.thinkTimeLeft = game.thinkTime;

    return game;
};

// The game is over - all players have hit a mine.
var actOnNoPlayersLeft = function(game) {
    console.log("Game over: No players left alive");
    // Mark the games as being over
    return markGameEnded(game);
};

// The game is over - all mines have been open but there are surviving players
var actOnNoMinesLeft = function(game) {
    console.log("Game over: All mine fields have been open");
    // Mark the games as being over
    return markGameEnded(game);
};

// The game is over - all non-mine cells have been open - the game is beaten
var actOnNoCellsLeft = function(game) {
    console.log("Game over: Game beaten");
    game = scoring.applyGameBeatenBonus(game);

    // Mark the games as being over
    return markGameEnded(game);
};

var verifyGameEndConditions = function(game) {
    var unopenCells = grid.countUnopenCells(game.map);

    // The game shall end in three cases:

    // 1. There are no surviving players
    if (!hasLivingPlayers(game.players)) {
        return actOnNoPlayersLeft(game);
    }

    // 2. All cells containing a mine have been open (possible if players > mines)
    else if (unopenCells.mineCount === 0) {
        return actOnNoMinesLeft(game);
    }

    // 3. All cells not containing a mine have been open (=game beaten)
    else if (unopenCells.emptyCellCount === 0) {
        return actOnNoCellsLeft(game);
    }

    return game;
};

// Check if a game has reached the inactivity threshold;
// use to find out when a game should be deleted from the games list.
var inactivityThresholdReached = function(game) {
    var timeSinceLastAction = getCurrentTime() - game.timeControl.lastActed;
    return timeSinceLastAction > config.maxGameNonUpdatedInterval;
};

var hasLivingPlayers = function(players) {
    return getLivingPlayers(players).length;
}; 


var getCurrentPlayer = function(currentPlayerId, players, hops) {
    var playerIndex = 0;
    var livingPlayers = getLivingPlayers(players);

    for (var i = 0; i < livingPlayers.length; i++) {
        if (livingPlayers[i].id === currentPlayerId) {
            playerIndex = i;
            break;
        }
    }

    var targetIndex = playerIndex + hops;
    if (targetIndex < livingPlayers.length) {
        return livingPlayers[targetIndex];
    }
    return livingPlayers[targetIndex % livingPlayers.length];
};

var getLivingPlayers = function(players) {
    var livingPlayers = [];

    for (var i = 0; i < players.length; i++) {
        if (players[i].alive) {
            livingPlayers.push(players[i]);
        }
    }

    return livingPlayers;
};

exports.setCreated = setCreated;
exports.startGame = startGame;
exports.setLastActed = setLastActed;
exports.nextPlayer = nextPlayer;
exports.inactivityThresholdReached = inactivityThresholdReached;
exports.markGameEnded = markGameEnded;
(function () {
    'use strict';
    var TABLE_ROW = "tr";
    var TABLE_CELL = "td";
    var MILLIS_IN_SECOND = 1000;
    var timeToShow = 0;

    $(document).ready(function() {
        if (location.pathname.indexOf("/play") !== -1) {
            var gameId = location.pathname.replace("/play/", "");

            getGameStatus(gameId);

            // Get the game's status every 5s
            setInterval(function () {
                getGameStatus(gameId);
            }, 5000);

            // Update the game timer every 1s for smoother experience
            setInterval(function () {
                updateTimer();
            }, MILLIS_IN_SECOND);
        }
    });

    function getGameStatus(gameId) {
        gameApi.getStatus(gameId, displayStatus, handleError);
    }

    function displayStatus(response) {
        syncTimer(response);
        displayPlayerList(response.players);
    }

    function displayPlayerList(players) {
        var playersTable = $(constants.locators.gamePage.playerListing.table);
        playersTable.empty();

        for (var i = 0; i < players.length; i++) {
            var row = buildPlayerRow(players[i]);
            playersTable.append(row);
        }
    }

    function buildPlayerRow(player) {
        var row = $(document.createElement(TABLE_ROW));
        var nameCell = $(document.createElement(TABLE_CELL));
        var statusCell = $(document.createElement(TABLE_CELL));
        var scoreCell = $(document.createElement(TABLE_CELL));

        nameCell.text(player.name);
        statusCell.text(player.alive ? "Alive" : "Dead");
        scoreCell.text(player.score);

        row.append(nameCell);
        row.append(statusCell);
        row.append(scoreCell);

        return row;
    }

    function syncTimer(game) {
        var actionExpectedPanel = $(constants.locators.gamePage.actionExpected);
        var timeLeftPanel = $(constants.locators.gamePage.timeLeft);

        if (game.hasStarted) {
            actionExpectedPanel.text(game.currentPlayerTurn.userId + "'s turn");
            timeToShow = game.currentPlayerTurn.thinkTimeLeft;
        } else {
            actionExpectedPanel.text("The game starts in");
            timeToShow = game.gameStartsIn;
        }
    }

    function updateTimer() {
        var timeLeftPanel = $(constants.locators.gamePage.timeLeft);
        timeLeftPanel.text(millisecondsToTime(timeToShow));

        if (timeToShow - MILLIS_IN_SECOND > 0) {
            timeToShow -= MILLIS_IN_SECOND;
        } else {
            timeToShow = 0;
        }
    }

    function millisecondsToTime(s) {
        var ms = s % MILLIS_IN_SECOND;
        s = (s - ms) / MILLIS_IN_SECOND;
        var seconds = s % 60;
        s = (s - seconds) / 60;
        var minutes = s % 60;
        var hrs = (s - minutes) / 60;

        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return minutes + ':' + seconds;
    }

    function handleError(response) {
        // Session has expired, have the user log in again
        window.location.replace("/login");
    }
})();
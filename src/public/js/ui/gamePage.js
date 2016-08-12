(function () {
    'use strict';
    var TABLE_ROW = "tr";
    var TABLE_CELL = "td";
    var MILLIS_IN_SECOND = 1000;
    var RELOAD_FROM_SERVER = 5000;
    var timeToShow = 0;
    var gameId = null;

    $(document).ready(function() {
        if (location.pathname.indexOf("/play") !== -1) {
            gameId = location.pathname.replace("/play/", "");

            getGameStatus(gameId);

            // Get the game's status every 5s
            setInterval(function () {
                getGameStatus();
            }, RELOAD_FROM_SERVER);

            // Update the game timer every 1s for smoother experience
            setInterval(function () {
                updateTimer();
            }, MILLIS_IN_SECOND);
        }
    });

    // Click event for the Start game button
    $(constants.locators.gamePage.startGame.button).click(function (event) {
        gameApi.startGame(gameId, getGameStatus, handleError);
    });

    function getGameStatus() {
        gameApi.getStatus(gameId, displayStatus, handleError);
    }

    function displayStatus(response) {
        setTimeDisplay(response);
        displayStartGameButton(response);
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

    function setTimeDisplay(game) {
        var actionExpectedPanel = $(constants.locators.gamePage.actionExpected);
        var timeLeftPanel = $(constants.locators.gamePage.timeLeft);

        if (game.hasStarted) {
            var name = getCurrentUserDisplayName(game);
            actionExpectedPanel.text(name + "'s turn");
            timeToShow = game.currentPlayerTurn.thinkTimeLeft;
        } else {
            actionExpectedPanel.text("The game starts in");
            timeToShow = game.gameStartsIn;
        }
    }

    function getCurrentUserDisplayName(game) {
        for (var i = 0; i < game.players.length; i++) {
            if (game.players[i].id === game.currentPlayerTurn.userId) {
                return game.players[i].name;
            }
        }
    }

    function updateTimer() {
        var timeLeftPanel = $(constants.locators.gamePage.timeLeft);
        timeLeftPanel.text(millisecondsToTime(timeToShow));

        if (timeToShow - MILLIS_IN_SECOND > 0) {
            timeToShow -= MILLIS_IN_SECOND;
        } else {
            timeToShow = 0;
            getGameStatus();
        }
    }

    function displayStartGameButton(game) {
        var buttonContainer = $(
            constants.locators.gamePage.startGame.container);
        var hiddenClass = constants.classes.hiddenContainer;

        // Only the game host should be able to see the Start game button
        // and only when the game hasn't been started
        if (!game.isHost || game.hasStarted) {
            if (!buttonContainer.hasClass(hiddenClass)) {
                buttonContainer.addClass(hiddenClass);
            }
            return;
        }

        buttonContainer.removeClass(hiddenClass);

        if (game.canBeStarted) {
            $(constants.locators.gamePage.startGame.button)
                .removeAttr('disabled');
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
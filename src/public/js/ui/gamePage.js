/*jshint esversion: 6 */
(function () {
    'use strict';

    const TABLE_ROW = "tr";
    const TABLE_CELL = "td";
    const MILLIS_IN_SECOND = 1000;
    const RELOAD_FROM_SERVER = 2000;
    const VIBRATION_LENGTH_MS = 1000;
    var timeToShow = 0;
    var gameId = null;
    var initialMapDrawn = false;
    var hasGameEnded = false;
    var supportsVibration = "vibrate" in navigator;

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
        if (!hasGameEnded) {
            gameApi.getStatus(gameId, displayStatus, handleError);
        }
    }

    function displayStatus(response) {
        setTimeDisplay(response);
        displayStartGameButton(response);
        displayPlayerList(
            $(constants.locators.gamePage.playerListing.table),
            response.players, response.currentPlayerTurn.userId);

        if (response.hasEnded) {
            hasGameEnded = true;
            handleGameOver(response);
        }

        // Draw the game area with the first Status request
        if (!initialMapDrawn) {
            drawInitialMap(response.map);
            initialMapDrawn = true;
        } else {
            updateMap(response.map.cells);
        }
    }

    function displayPlayerList(table, players, currentPlayerId) {
        var playersTable = table;
        playersTable.empty();

        for (var i = 0; i < players.length; i++) {
            var row = buildPlayerRow(
                players[i], currentPlayerId === players[i].id);

            playersTable.append(row);
        }
    }

    function buildPlayerRow(player, isOwnTurn) {
        var row = $(document.createElement(TABLE_ROW));
        var nameCell = $(document.createElement(TABLE_CELL));
        var statusCell = $(document.createElement(TABLE_CELL));
        var scoreCell = $(document.createElement(TABLE_CELL));

        nameCell.text(player.name);
        nameCell.addClass(constants.classes.playerName);

        statusCell.addClass(
            player.alive ?
                constants.classes.playerAlive :
                constants.classes.playerDead);

        scoreCell.text(player.score);
        scoreCell.addClass(constants.classes.score);

        row.append(statusCell);
        row.append(nameCell);
        row.append(scoreCell);

        if (isOwnTurn) {
            row.addClass(constants.classes.playerInTurn);
        }

        return row;
    }

    function setTimeDisplay(game) {
        var actionExpectedPanel = $(constants.locators.gamePage.actionExpected);
        var timeLeftPanel = $(constants.locators.gamePage.timeLeft);

        if (game.hasStarted) {
            var name = getCurrentUserDisplayName(game);
            var textToUse = name + "'s turn";

            // Highlight it's the current user's turn
            if (game.currentPlayerTurn.isRequestee) {
                textToUse = "Your turn";
            }

            actionExpectedPanel.text(textToUse);
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

    function drawInitialMap(map) {
        var mapX = parseInt(map.x);
        var mapY = parseInt(map.y);
        var table = $(constants.locators.gamePage.map.table);

        for (var yIndex = 0; yIndex < mapY; yIndex++) {
            var row = $(document.createElement(TABLE_ROW));

            for (var xIndex = 0; xIndex < mapX; xIndex++) {
                var cell = $(document.createElement(TABLE_CELL));
                cell.addClass(constants.classes.cell.cell);
                cell.addClass(constants.classes.cell.closed);
                cell.bind('click', {x: xIndex, y: yIndex}, clickCell);

                row.append(cell);
            }

            table.append(row);
        }
    }

    function updateMap(openCells) {
        for (var i = 0; i < openCells.length; i++) {
            var cell = openCells[i];
            var classToAdd = constants.classes.cell.open;
            var row = $($(constants.locators.gamePage.map.table + " tr")[cell.y]);
            var td = $(row.find("td")[cell.x]);

            if (cell.isMine) {
                classToAdd = constants.classes.cell.mine;
            } else if (cell.neighboringMineCount > 0) {
                classToAdd = constants.classes.cell.number;
                td.text(cell.neighboringMineCount);
            }

            td.addClass(classToAdd);
        }
    }

    function handleGameOver(response) {
        displayPlayerList(
            $(constants.locators.gamePage.gameOver.playerListing),
            response.players, response.currentPlayerTurn.userId);

        $(constants.locators.gamePage.gameOver.popup).removeClass(
            constants.classes.hiddenContainer);
    }

    var clickCell = function(data) {
        var x = data.data.x;
        var y = data.data.y;

        gameApi.makeMove(gameId, x, y, function(response) {
            if (supportsVibration && response.success && response.hitMine) {
                navigator.vibrate(VIBRATION_LENGTH_MS);
            }
            getGameStatus();
        });
    };

    function handleError(response) {
        // Session has expired, have the user log in again
        window.location.replace("/login");
    }
})();
(function () {
    'use strict';
    var TABLE_ROW = "tr";
    var TABLE_CELL = "td";

    $(document).ready(function() {
        if (location.pathname.indexOf("/play") !== -1) {
            var gameId = location.pathname.replace("/play/", "");

            getGameStatus(gameId);

            setInterval(function () {
                getGameStatus(gameId);
            }, 5000);
        }
    });

    function getGameStatus(gameId) {
        gameApi.getStatus(gameId, displayStatus, handleError);
    }

    function displayStatus(response) {
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

    function handleError(response) {
        
    }
})();
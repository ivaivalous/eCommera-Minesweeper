(function () {
    'use strict';
    var gamesInProgress = [];
    var TABLE_ROW = "tr";
    var TABLE_CELL = "td";

    // Click event for the load games in progress button
    $(constants.locators.gameListing.button).click(function (event) {
        getGamesList();
    });

    $(document).ready(function() {
        if (location.pathname.indexOf("/dashboard") !== -1) {
            getGamesList();
        }
    });

    function getGamesList() {
        gameApi.listGames(printGames, goToLoginPage);
    }

    function printGames(gamesList) {
        var gamesTable = $(constants.locators.gameListing.gameListBody);
        gamesTable.empty();

        if (!gamesList.length) {
            // No games available
            gamesTable.append(buildEmptyRow());
            return;
        }

        for (var i = 0; i < gamesList.length; i++) {
            var game = gamesList[i];

            var roomName = buildRoomNameCell(game);
            var host = buildHostCell(game);
            var players = buildPlayersCell(game);
            var mapSize = buildMapSizeCell(game);
            var joinLink = buildJoinLinkCell(game);

            gamesTable.append(
                buildRow(roomName, host, players, mapSize, joinLink));
        }
    }

    function goToLoginPage() {
        // Session has expired, have the user log in again
        window.location.replace("/login");
    }

    function buildRoomNameCell(game) {
        var td = $(document.createElement(TABLE_CELL));
        td.text(game.gameParameters.roomName);
        return td;
    }

    function buildHostCell(game) {
        var td = $(document.createElement(TABLE_CELL));
        var link = $(document.createElement('a'));

        link.text(game.hostUser.userDisplayName);
        link.attr("href", "/user/" + game.hostUser.userId);

        td.append(link);
        return td;
    }

    function buildPlayersCell(game) {
        var td = $(document.createElement(TABLE_CELL));
        td.text(game.playersCount + "/" + game.gameParameters.maxPlayers);
        return td;
    }

    function buildMapSizeCell(game) {
        var td = $(document.createElement(TABLE_CELL));
        td.text(game.gameParameters.sizeX + " x " + game.gameParameters.sizeY);
        return td;
    }

    function buildJoinLinkCell(game) {
        var td = $(document.createElement(TABLE_CELL));
        var joinButton = $(document.createElement("button"));

        joinButton.text("Join");
        joinButton.on("click", function () {
            joinGame(game.id)
        });

        td.append(joinButton);
        return td;
    }

    function buildRow(roomCell, hostCell, playersCell, mapSizeCell, joinLinkCell) {
        var tr = $(document.createElement(TABLE_ROW));

        tr.append(roomCell);
        tr.append(hostCell);
        tr.append(playersCell);
        tr.append(mapSizeCell);
        tr.append(joinLinkCell);

        return tr;
    }

    function buildEmptyRow() {
        var tr = $(document.createElement(TABLE_ROW));
        var td = $(document.createElement(TABLE_CELL));

        td.text(
            "There are no games available to join. " +
            "You can create one.");
        td.attr("colspan", "5");
        td.addClass(constants.classes.centered);

        tr.append(td);
        return tr;
    }

    function joinGame(gameId) {
        window.location.replace("/play/" + gameId);
    }
})();
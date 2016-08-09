(function () {
    'use strict';

    $(constants.locators.gameListing.button).click(function (event) {
        getGamesList();
    });

    $(document).ready(function() {
        getGamesList();
    });

    function getGamesList() {
        gameApi.listGames(function () {});
    }
})();
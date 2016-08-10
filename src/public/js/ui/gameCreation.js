(function () {
    'use strict';

    // Click event for opening the game creation form popup
    $(constants.locators.gameCreation.openFormButton).click(function (event) {
        $(constants.locators.gameCreation.form).removeClass(
            constants.classes.hiddenContainer);
    });

    // Click event for closing the game creation form popup upon
    // clicking cancel
    $(constants.locators.gameCreation.cancelButton).click(function (event) {
        event.preventDefault();
        $(constants.locators.gameCreation.form).addClass(
            constants.classes.hiddenContainer);
    });

    // Submitting the game creation form
    $(constants.locators.gameCreation.submitButton).click(function (event) {
        event.preventDefault();
        
        var roomName = $(constants.locators.gameCreation.roomName).val();
        var maxPlayers = $(constants.locators.gameCreation.maxPlayers).val();
        var mapSizeX = $(constants.locators.gameCreation.sizeX).val();
        var mapSizeY = $(constants.locators.gameCreation.sizeY).val();
        var mineCount = $(constants.locators.gameCreation.mineCount).val();
        var isPublic = $(constants.locators.gameCreation.isPublic).is(":checked");

        // Add client-side validation here

        gameApi.createGame(
            roomName, mapSizeX, mapSizeY,
            maxPlayers, mineCount, isPublic,
            joinGame, displayCreationFailureFeedback);
    });

    function joinGame(response) {
        window.location.replace("/join/" + response.gameId);
    }

    function displayCreationFailureFeedback(error) {
        // Display feedback why game creation failed
        console.log(error);
        var errorContainer = $(constants.locators.gameCreation.errorContainer);
        errorContainer.removeClass(constants.classes.hiddenContainer);

        // TODO: pretty and more subtle
        errorContainer.text("Error: " + error.responseJSON.error);
    }

})();
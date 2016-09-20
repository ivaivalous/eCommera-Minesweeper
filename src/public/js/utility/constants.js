(function () {
    'use strict';

    var constants = window.constants || (window.constants = {});

    constants.locators = {};

    constants.locators.login = {
        email: "#login-email",
        password: "#login-password",
        submit: "#login-submit",
        container: "#login",
        facebook: {
            button: "#login-facebook"
        }
    };

    constants.locators.register = {
        email: "#register-email",
        name: "#register-name",
        password: "#register-password",
        passwordConfirm: "#register-password-confirm",
        submit: "#submit-registration",
        container: "#register",
        successContainer: "#registration-success"
    };

    constants.locators.gameListing = {
        button: "#reload-games",
        gamesTable: "#games-list",
        gameListBody: "#games-list-body"
    };

    constants.locators.gameCreation = {
        form: "#create-game-form",
        openFormButton: "#create-game",
        cancelButton: "#cancel-create",
        submitButton: "#create-game-submit",
        roomName: "#game-name",
        maxPlayers: "#game-players",
        sizeX: "#game-map-x",
        sizeY: "#game-map-y",
        mineCount: "#game-mine-count",
        isPublic: "#game-public",
        errorContainer: "#game-create-error"
    };

    constants.locators.gamePage = {
        playerListing: {
            table: "#players-list"
        },
        actionExpected: "#action-expected",
        timeLeft: "#time-left",
        startGame: {
            container: "#start-game",
            button: "#start-game-button"
        },
        map: {
            table_body: "#game-map-body",
            table: "#game-map"
        },
        gameOver: {
            popup: "#game-over-screen",
            playerListing: "#players-table-game-over",
            startNew: "#start-new-game"
        }
    };

    constants.locators.updatePage = {
        nameInput: "#update-name",
        emailInput: "#update-email",
        previousPasswordInput: "#update-prev-pass",
        newPasswordInput: "#update-new-pass",
        newPasswordInputConfirm: "#update-new-pass-confirm",
        submit: "#update-submit",
        successContainer: "#update-success"
    };

    constants.classes = {
        hiddenContainer: "hidden",
        centered: "centered",
        playerInTurn: "now-playing",
        playerAlive: "status-cell alive",
        playerDead: "status-cell dead",
        playerName: "player-name",
        linethrough: "lie_decoration",
        score: "score-cell",
        cell: {
            cell: "cell",
            closed: "closed",
            open: "open",
            mine: "mine",
            number: "number",
            numberPartial: "number-",
            flagged: "flagged"
        },
        validationError: "validation-error"
    };

    constants.facebookAppId = "325243901154450";

    constants.keys = {
        enter: 13
    };

    constants.regex = {
        emailValidation: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        displayNameValidation: /^.{2,64}$/,
        passwordValidation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w]).{8,100}$/
    };

    constants.validationMessages = {
        passwordsNoMatch: "Passwords don't match",
        invalidEmail: "Please make sure to submit a valid email",
        invalidName: "We'll happily accept any name between 2 and 64 characters in length",
        invalidPassword: (
            "Your password has to be no shorter than 8 characters, " +
            "with small and capital letters, and special characters. " +
            "Tough, yes, but it keeps you safe."),
        missingPassword: "We need your current password so we can confirm your indentity",
        registrationSuccess: (
            "Registration went A-OK! " +
            "You can now log into your account. " +
            "You will be redirected to the login page in 5 seconds"),
        updateSuccess: "You account was updated successfully"
    };
})();

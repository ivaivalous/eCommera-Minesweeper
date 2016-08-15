(function () {
    'use strict';

    var constants = window.constants || (window.constants = {});

    constants.locators = {
        login: {
            email: "#login-email",
            password: "#login-password",
            submit: "#login-submit",
            container: "#login"
        },
        register: {
            email: "#register-email",
            name: "#register-name",
            password: "#register-password",
            passwordConfirmation: "#register-password-confirm",
            submit: "#submit-registration",
            container: "#register"
        },
        gameListing: {
            button: "#reload-games",
            gamesTable: "#games-list",
            gameListBody: "#games-list-body"
        },
        gameCreation: {
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
        },
        gamePage: {
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
                table: "#game-map-body"
            }
        }
    };

    constants.classes = {
        hiddenContainer: "hidden",
        centered: "centered",
        playerInTurn: "now-playing",
        playerAlive: "status-cell alive",
        playerDead: "status-cell dead",
        playerName: "player-name",
        score: "score-cell",
        cell: {
            cell: "cell",
            closed: "closed",
            open: "open",
            mine: "mine",
            number: "number"
        }
    };

    constants.keys = {
        enter: 13
    };

    constants.regex = {
        emailValidation: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        displayNameValidation: /^.{2,64}$/,
        passwordValidation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*([^\w])).{8,100}$/
    }
})();
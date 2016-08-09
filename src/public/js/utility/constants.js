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
            gameListTemplate: "#games-list"
        },
        jwtContainer: "#jwt"
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
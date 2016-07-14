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
        }
    }

    constants.keys = {
        enter: 13
    }
})();
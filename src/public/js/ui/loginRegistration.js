(function () {
    'use strict';

    // Submit login information to the API
    function login() {
        var email = $(constants.locators.login.email).val();
        var password = $(constants.locators.login.password).val();

        loginApi.login(email, password);
    }

    // Submit registration information to the API
    function register() {
        var email = $(constants.locators.register.email).val();
        var displayName = $(constants.locators.register.name).val();
        var password = $(constants.locators.register.password).val();

        loginApi.register(email, displayName, password);
    }

    // "Log In" button on the login page - handle submission
    $(constants.locators.login.submit).click(function (event) {
        event.preventDefault();
        login();
    });

    // Login form - handle submission on pressing enter
    $(constants.locators.login.container).onkeydown = function (event) {
        event.preventDefault();
        // Submit the form on pressing Enter
        if (event.keyCode === constants.keys.enter) {
            login();
        }
    };

    // "Register" button on the register page - handle registration
    $(constants.locators.register.submit).click(function (event) {
        event.preventDefault();
        register();
    });

    function validatePasswordsMatch() {
        var password = $(constants.locators.register.password).val();
        var passwordConfirmation = $(
            constants.locators.register.passwordConfirmation).val();

        return password === passwordConfirmation;
    }
})();
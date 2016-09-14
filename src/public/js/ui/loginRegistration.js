(function () {
    'use strict';

    // Submit login information to the API
    function login() {
        var email = $(constants.locators.login.email).val();
        var password = $(constants.locators.login.password).val();

        loginApi.login(email, password);
    }

    // "Login With Facebook" button on the login page
    $(constants.locators.login.facebook.button).click(function (event) {
        event.preventDefault();
        loginWithFacebook();
    });

    // Submit registration information to the API
    function register() {
        var email = $(constants.locators.register.email).val();
        var displayName = $(constants.locators.register.name).val();
        var password = $(constants.locators.register.password).val();
        var confirmation =  $(constants.locators.register.passwordConfirm).val();

        // Clear any validation errors that might've occured during
        // previous submissions
        clearValidationErrors();

        try {
            // Make sure all user-supplied data is valid
            validateRegistrationForm();
        } catch (e) {
            // If any issues were discovered with user data,
            // let the user know and halt the registration process
            displayValidationError(e.locator, e.message);
            return;
        }

        // Proceed with actual registration; display an error
        // message if the server has found any issue with the data
        loginApi.register(
            email, displayName, password,
            displayRegistrationSuccessMessage,
            displayRegistrationBackendError
        );
    }

    // Call when registration was successful to provide the user with feedback.
    function displayRegistrationSuccessMessage(response) {
        displaySuccessMessage(
            constants.validationMessages.registrationSuccess);
    };

    // Even though there is front-end validation of user-supplied data
    // no input from the user can really be trusted to have passed validation.
    // Display any validation errors discovered by the server.
    function displayRegistrationBackendError(error) {
        displayValidationError(
            constants.locators.register.email, error.message);
    };

    function validateRegistrationForm() {
        var email = $(constants.locators.register.email).val();
        var displayName = $(constants.locators.register.name).val();
        var password = $(constants.locators.register.password).val();

        // Build an error object for displaying validation errors
        var buildError = function(locator, message) {
            return {
                locator: locator,
                message: message
            };
        };

        // Is the display name the user chose valid?
        if (!isDisplayNameValid(displayName)) {
            throw buildError(
                constants.locators.register.name,
                constants.validationMessages.invalidName);
        }

        // Is the email the user submitted valid?
        if (!isEmailValid(email)) {
            throw buildError(
                constants.locators.register.email,
                constants.validationMessages.invalidEmail);
        }

        if (!passwordValid(password)) {
            throw buildError(
                constants.locators.register.password,
                constants.validationMessages.invalidPassword);
        }

        // Do the password and its confirmation match?
        if (!passwordsMatch()) {
            throw buildError(
                constants.locators.register.passwordConfirm,
                constants.validationMessages.passwordsNoMatch);
        }
    }

    function loginWithFacebook() {
        socialLoginApi.login();
    }

    // "Register" button on the register page - handle registration
    $(constants.locators.register.submit).click(function (event) {
        event.preventDefault();
        register();
    });

    function passwordsMatch() {
        var password = $(constants.locators.register.password).val();
        var passwordConfirmation = $(
            constants.locators.register.passwordConfirm).val();

        return password.length && password === passwordConfirmation;
    }

    function passwordValid(password) {
        var re = constants.regex.passwordValidation;
        return re.test(password);
    }

    function isEmailValid(email) {
        var re = constants.regex.emailValidation;
        return re.test(email);
    }

    function isDisplayNameValid(displayName) {
        var re = constants.regex.displayNameValidation;
        return re.test(displayName);
    }

    // Display a success message on the register page
    function displaySuccessMessage(message) {
        $(constants.locators.register.successContainer).removeClass(
            constants.classes.hiddenContainer).text(message);
    }

    function displayValidationError(locator, errorMessage) {
        var errorSpan = $("<span></span>");

        errorSpan.addClass(constants.classes.validationError);
        errorSpan.text(errorMessage);

        $(locator).before(errorSpan);
    }

    // Before displaying a validation error message, you can clear any
    // that have been displayed already.
    function clearValidationErrors() {
        $('.' + constants.classes.validationError).remove()
    }
})();
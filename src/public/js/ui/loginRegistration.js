/*jshint esversion: 6 */
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

    // "Register" button on the register page - handle registration
    $(constants.locators.register.submit).click(function (event) {
        event.preventDefault();
        register();
    });

    // "Submit" button on the account page - handle profile update
    $(constants.locators.updatePage.submit).click(function (event) {
        event.preventDefault();
        updateProfile();
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

    function updateProfile() {
        var locators = constants.locators.updatePage;
        var email = $(locators.emailInput).val();
        var displayName = $(locators.nameInput).val();
        var previousPassword = $(locators.previousPasswordInput).val();
        var newPassword = $(locators.newPasswordInput).val();
        var newPasswordConfirmation = $(locators.newPasswordInputConfirm).val();

        // Clear any validation errors that might've occured during
        // previous submissions
        clearValidationErrors();

        try {
            // Make sure all user-supplied data is valid
            validateUpdateForm();
        } catch (e) {
            // If any issues were discovered with user data,
            // let the user know and halt the registration process
            displayValidationError(e.locator, e.message, true);
            return;
        }

        // Don't do anything about the old password:
        // the server will validate it

        // Send the updateProfile request to the server
        // Deal with the response - display error/success message
        loginApi.updateAccount(
            displayName, email, previousPassword, newPassword,
            displayUpdateSuccessMessage,
            displayUpdateBackendError
        );
    }

    // Call when registration was successful to provide the user with feedback.
    function displayRegistrationSuccessMessage(response) {
        displaySuccessMessage(
            constants.locators.register.successContainer,
            constants.validationMessages.registrationSuccess);
    }

    // Even though there is front-end validation of user-supplied data
    // no input from the user can really be trusted to have passed validation.
    // Display any validation errors discovered by the server.
    function displayRegistrationBackendError(error) {
        displayValidationError(
            constants.locators.register.email, error.message);
    }

    // Call when the user's account has been updated successful to let her know
    function displayUpdateSuccessMessage(response) {
        displaySuccessMessage(
            constants.locators.updatePage.successContainer,
            constants.validationMessages.updateSuccess);
    }

    // Display any update form errors reported by the backend
    function displayUpdateBackendError(response) {
        displayValidationError(
            constants.locators.updatePage.nameInput, response.message, true);
    }

    function validateRegistrationForm() {
        var email = $(constants.locators.register.email).val();
        var displayName = $(constants.locators.register.name).val();
        var password = $(constants.locators.register.password).val();
        var passwordConfirmation = $(
            constants.locators.register.passwordConfirm).val();

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
        if (!passwordsMatch(password, passwordConfirmation)) {
            throw buildError(
                constants.locators.register.passwordConfirm,
                constants.validationMessages.passwordsNoMatch);
        }
    }

    function validateUpdateForm() {
        const locators = constants.locators.updatePage;

        var email = $(locators.emailInput).val();
        var displayName = $(locators.nameInput).val();

        var currentPassword = $(locators.previousPasswordInput).val();
        var newPassword = $(locators.newPasswordInput).val();
        var newPasswordConfirm = $(locators.newPasswordInputConfirm).val();

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
                locators.nameInput,
                constants.validationMessages.invalidName);
        }

        // Is the email the user submitted valid?
        if (!isEmailValid(email)) {
            throw buildError(
                locators.emailInput,
                constants.validationMessages.invalidEmail);
        }

        // Only verify the user has filled up the previous password
        // It can't be regex-validated as the regex could've been
        // changed since the user set the password.
        if (!currentPassword.length) {
            throw buildError(
                locators.previousPasswordInput,
                constants.validationMessages.missingPassword);
        }

        // The user may leave the new password and new password
        // confirmation inputs empty if she doesn't want to have
        // her password changed.
        // It is still necessary to supply the current password.
        if (!newPassword.length && !newPasswordConfirm.length) {
            return;
        }

        if (!passwordValid(newPassword)) {
            throw buildError(
                locators.newPasswordInput,
                constants.validationMessages.invalidPassword);
        }

        // Do the password and its confirmation match?
        if (!passwordsMatch(newPassword, newPasswordConfirm)) {
            throw buildError(
                locators.newPasswordInputConfirm,
                constants.validationMessages.passwordsNoMatch);
        }
    }

    function loginWithFacebook() {
        socialLoginApi.login();
    }

    function passwordsMatch(password, passwordConfirmation) {
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
    function displaySuccessMessage(successLocator, message) {
        $(successLocator).removeClass(
            constants.classes.hiddenContainer).text(message);
    }

    function displayValidationError(locator, errorMessage, attachToParent) {
        var errorSpan = $("<span></span>");

        errorSpan.addClass(constants.classes.validationError);
        errorSpan.text(errorMessage);

        if (attachToParent) {
             $(locator).parent().before(errorSpan);
        } else {
            $(locator).before(errorSpan);
        }
    }

    // Before displaying a validation error message, you can clear any
    // that have been displayed already.
    function clearValidationErrors() {
        $('.' + constants.classes.validationError).remove();
    }
})();
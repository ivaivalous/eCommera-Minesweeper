(function () {
    'use strict';

    var loginApi = window.loginApi || (window.loginApi = {});

    loginApi.register = function(
            email, displayName, password, successCallback, errorCallback) {

        var REDIRECTION_TIMEOUT = 6000;

        $.post('register', {
            email: email,
            displayName: displayName,
            password: password
        })
        .done(function(data) {
            if(data.success === true) {
                // Hide the login form
                $(constants.locators.register.container).addClass(
                    constants.classes.hiddenContainer);

                // Redirect the user to the login page
                setTimeout(function() {
                    window.location = '/login';
                }, REDIRECTION_TIMEOUT);

                successCallback(data);
            } else {
                errorCallback(data);
            }
        });
    };

    // Authenticate a user who has authenticated with Facebook with
    // the Minesweeper backend
    loginApi.facebookLogin = function(name, email, userId, accessToken) {
        $.post('facebookLogin', {
            name: name,
            email: email,
            userId: userId,
            accessToken: accessToken
        }).done(function() {
            window.location = '/dashboard';
        });
    };

    loginApi.updateAccount = function(
            name, email, currentPassword, newPassword,
            successCallback, errorCallback) {

        $.post('account', {
            name: name,
            email: email,
            currentPassword: currentPassword,
            newPassword: newPassword
        }).done(function(response) {
            if (response.success) {
                successCallback(response);
            } else {
                errorCallback(response);
            }
        });
    };
})();
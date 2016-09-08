(function () {
    'use strict';

    var loginApi = window.loginApi || (window.loginApi = {});

    loginApi.register = function(email, displayName, password) {
        var REDIRECTION_TIMEOUT = 6000;

        $.post('register', {
            email: email,
            displayName: displayName,
            password: password
        })
        .done(function(data) {
            if(data.success === true) {
                $(constants.locators.register.container).addClass(
                    constants.classes.hiddenContainer);
                setTimeout(function() {
                    window.location = '/login';
                }, REDIRECTION_TIMEOUT);
            }
            $(constants.locators.register.error).html(
                data.message).removeClass(
                    constants.classes.hiddenContainer);
        });
    };

    // Authenticate a user who has authenticated with Facebook with
    // the Minesweeper backend
    loginApi.facebookLogin = function(name, email, accessToken) {
        $.post('facebookLogin', {
            name: name,
            email: email,
            accessToken: accessToken
        })
        .done(function(data) {
            if(data.success === true) {
                // Handle success
            }
        });
    };
})();
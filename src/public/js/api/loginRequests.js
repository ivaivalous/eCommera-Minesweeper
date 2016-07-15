(function () {
    'use strict';

    var loginApi = window.loginApi || (window.loginApi = {});

    loginApi.register = function(email, displayName, password) {
        $.post('register', {
            email: email,
            displayName: displayName,
            password: password
        });
    }
})();
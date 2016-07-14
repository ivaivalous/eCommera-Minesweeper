(function () {
    'use strict';

    var loginApi = window.loginApi || (window.loginApi = {});


    loginApi.login = function(email, password) {
        $.post('login', {
            email: email,
            password: password
        },
        function (data) {
            if (data.loginSuccessful === false) {
                // Handle failing login
            } else {
                localStorage.setItem("session", JSON.stringify(data));
                history.go(0);
            }
        });
    }

    loginApi.register = function(email, displayName, password) {
        $.post('register', {
            email: email,
            displayName: displayName,
            password: password
        },
        function (data) {
            if (data.loginSuccessful === false) {
                // Handle failing login
            } else {
                localStorage.setItem("session", JSON.stringify(data));
                history.go(0);
            }
        });
    }
})();
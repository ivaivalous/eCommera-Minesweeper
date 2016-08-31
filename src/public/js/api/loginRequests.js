(function () {
    'use strict';

    var loginApi = window.loginApi || (window.loginApi = {});

    loginApi.register = function(email, displayName, password) {
        $.post('register', {
            email: email,
            displayName: displayName,
            password: password
        })
        .done(function(data){
            if(data.success == true){
                $('#register').addClass('hidden');
                 setTimeout(function() {
                window.location = '/login';
            }, 6000);
            }
            $('#invalidsuccess').html(data.message).removeClass('hidden');
        });
    }
})();
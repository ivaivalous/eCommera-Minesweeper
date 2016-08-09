(function () {
    'use strict';

    var request = window.request || (window.request = {});

    request.requestPost = function(
            urlArray, paramsObject, callback, callbackOnError) {
        request(
            'POST', urlArray, true,
            {'Content-Type': 'application/x-www-form-urlencoded'},
            paramsObject, callback, callbackOnError);
    };

    request.requestGet = function(urlArray, callback, callbackOnError) {
        if (isAuthenticated()) {
            request.request(
                'GET', urlArray, true, null, null,
                callback, callbackOnError);
        }
    };

    request.request = function(
            method, urlArray, contentType,
            headers, data, callback, callbackOnError) {

        // You may choose not to handle the error case specifially
        var callbackOnErrorToUse = (callbackOnError === undefined ?
                                    defaultErrorHandle : callbackOnError);

        $.ajax({
            url: buildUrl(urlArray),
            type: method,
            data: (data == undefined ? {} : $.param(data)),
            contentType: contentType,
            headers: (headers == undefined ? {} : headers),
            success: callback,
            error: callbackOnErrorToUse
        });                
    };

    function buildUrl(urlArray) {
        var url = "";
        var i = 0;

        for(i = 0; i < urlArray.length; i++) {
            url += urlArray[i] + "/";
        }

        return url;
    };

    function isAuthenticated() {
        return true;
    };

    function defaultErrorHandle(response) {
    }
})();
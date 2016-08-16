(function () {
    'use strict';

    var request = window.request || (window.request = {});

    request.requestPost = function(
            urlArray, paramsObject, callback, callbackOnError) {
        request.request(
            'POST', urlArray,
            'application/x-www-form-urlencoded',
            {}, paramsObject, callback, callbackOnError);
    };

    request.requestGet = function(urlArray, callback, callbackOnError) {
        request.request(
            'GET', urlArray, true, null, null,
            callback, callbackOnError);
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
            data: (data === undefined || data === null ? {} : $.param(data)),
            contentType: contentType,
            headers: (headers === undefined || data === null ? {} : headers),
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
    }

    function defaultErrorHandle(response) {
    }
})();
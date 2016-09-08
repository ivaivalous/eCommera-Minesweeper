/*
    Do backend to Facebook communication.
    Primary usage: verify user access tokens against the Facebook API
    to prevent impersonation.
*/

"use strict";

var config = require('../config');
var https = require("https");

// Do a token debug request and act on the received data
var actOnDebugData = function(userAccessToken, callback, errorCallback) {
    var appSecret = config.social.facebook.applicationSecret;
    var path = buildTokenDebugPath(userAccessToken, appSecret);
    var options = getGraphRequestOptions(path);

    var req = https.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function (body) {
            try {
                var bodyJson = JSON.parse(body);
                callback(bodyJson);
            } catch (exception) {
                // Response body was not valid JSON
                errorCallback(body, exception);
            }
        });
    });
    req.end();
};

var buildTokenDebugPath = function(userAccessToken, applicationToken) {
    var path = "/debug_token?input_token=" + userAccessToken;
    path += "&access_token=" + applicationToken;

    return path;
};

var getGraphRequestOptions = function(path) {
    return {
        hostname: 'graph.facebook.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {}
    };
};

exports.actOnDebugData = actOnDebugData;
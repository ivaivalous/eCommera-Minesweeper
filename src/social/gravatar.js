/*
    Use the Gravatar service to generate an avatar based
    on the user's email address.
*/

"use strict";

var config = require('../config');
var auth = require('../authentication');
var https = require("https");

var getGravatarUri = function(email) {
    // See http://en.gravatar.com/site/implement/images/
    var emailHash = getEmailHash(email);
    var url = emailHash;

    // Set dimension
    url += "?s=100";

    // Set the default user avatar
    url += "&d=" + getDefaultImageUrl();

    // Set image content rating: "suitable for all"
    url += "&r=g";

    return url;
};

var getEmailHash = function(email) {
    // See http://en.gravatar.com/site/implement/hash/
    var emailNormalized = email.trim().toLowerCase();
    return auth.md5(emailNormalized);
};

var getDefaultImageUrl = function() {
    var url = config.social.gravatar.defaultImageUrl;
    return encodeURIComponent(url);
};

exports.getGravatarUri = getGravatarUri;
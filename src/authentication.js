/*
    Handle user security functionality such as
    generating hashesm salts and passwords.
*/

"use strict";

var crypto = require('crypto');
var config = require('./config');

exports.hashPassword = function(password, salt) {
    var iterations = config.passwordHashing.numberOfIterations;
    var keyLength = config.passwordHashing.keyLengthBytes;

    var hash = crypto.pbkdf2Sync(
        password, salt, iterations, keyLength);

    return Buffer(hash, 'binary').toString('hex');
};

// Generate a random salt.
// Should be used on registration and password change.
// On login, salt is retrieved from the DB.
exports.generateSalt = function () {
    return crypto.randomBytes(16).toString('hex');
};

// When Facebook-registering a user, a random password
// ought to be generated as the user would be logging in without
// an actual password.
exports.generatePassword = function () {
    var minLength = 32;
    var maxLength = 64;

    return crypto.randomBytes(
        ~~(Math.random() * (maxLength - minLength + 1) + minLength)
    ).toString('utf8');
}

// Get the MD5 hash of a string
exports.md5 = function(input) {
    return crypto.createHash('md5').update(input).digest("hex");
};
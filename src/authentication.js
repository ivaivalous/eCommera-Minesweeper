var crypto = require('crypto');
var config = require('./config');

exports.hashPassword = function(password, salt) {
    var iterations = config.passwordHashing.numberOfIterations;
    var keyLength = config.passwordHashing.keyLengthBytes;

    var hash = crypto.pbkdf2Sync(
        password, salt, iterations, keyLength);

    return Buffer(hash, 'binary').toString('hex');
}

// Generate a random salt.
// Should be used on registration and password change.
// On login, salt is retrieved from the DB.
exports.generateSalt = function () {
    return crypto.randomBytes(16).toString('hex');
}
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var config = require('./config');

var _configuration = {
    jwtSecret: config.jwt.secret,
    jwtTtlHours: config.jwt.ttlHours + 'h',
    algorithm: config.jwt.algorithm
}

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

exports.issueJwt = function(email, displayName) {
    var data = {email: email, displayName: displayName};
    var token = jwt.sign(
        data, _configuration.jwtSecret,
        {
            algorithm: _configuration.algorithm,
            expiresIn: _configuration.jwtTtlHours
        }
    );

    return token;
}

exports.validateJwt = function(token) {
    return jwt.verify(
        token,
        _configuration.jwtSecret,
        { algorithms: [_configuration.algorithm] }
    );
}
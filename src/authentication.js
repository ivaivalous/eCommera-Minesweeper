var jwt = require('jsonwebtoken');

var config = require('./config');

var _configuration = {
    jwtSecret: config.jwt.secret,
    jwtTtlHours: config.jwt.ttlHours,
    algorithm: config.jwt.algorithm
}
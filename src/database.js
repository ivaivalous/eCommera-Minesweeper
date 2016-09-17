/*
    Handle MySQL database connectivity and querying.
    It's recommended you rely on this module for all DB interaction.
*/

var mysql = require('mysql');
var config = require('./config');

var pool = null;

function getPool() {
    if (pool === null) {
        console.log("Initializing MySQL connection pool");
        pool = mysql.createPool({
            connectionLimit : 10,
            host            : config.database.host,
            user            : config.database.user,
            password        : config.database.password,
            database        : config.database.database
        });
    }

    return pool;
}

// Run a query against the database
function query (queryLiteral, params, callback) {
    getPool().getConnection(function(errorGettingConnection, connection) {
        if (errorGettingConnection) {
            // Error getting a connection
            callback(errorGettingConnection);
            return;
        }

        connection.query(queryLiteral, params, function(err, rows) {
            callback(err, rows);
            connection.release();
        });
    });
}

exports.query = query;
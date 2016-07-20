var mysql = require('mysql');

var _credentials = {
  host     : '',
  user     : '',
  password : '',
  database : ''
};

function setCredentials (newCredentials) {
    _credentials.host = newCredentials.host || '';
    _credentials.user = newCredentials.user || '';
    _credentials.password = newCredentials.password || '';
    _credentials.database = newCredentials.database || '';
}

function connect (callback) {
    var connection = mysql.createConnection({
        host : _credentials.host,
        user : _credentials.user,
        password : _credentials.password,
        database : _credentials.database
    });

    connection.connect(function (err) {
        callback(err, connection)
    });
}

// Run a query against the database
function query (queryLiteral, params, callback) {
    // connect to the database first
    connect(function (error, connection) {
        if (error) {
            // let the caller script handle the error
            callback(error);
            return;
        }

        // execute the query and then the callback both when errors occur or not
        connection.query(queryLiteral, params, callback);
    });
}

exports.setCredentials = setCredentials;
exports.connect = connect;
exports.query = query;
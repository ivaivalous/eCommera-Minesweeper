var mysql = require('mysql');

var _credentials = {
  host     : '',
  user     : '',
  password : '',
  database : ''
};

exports.setCredentials = function (newCredentials) {
	_credentials.host = newCredentials.host || '';
	_credentials.user = newCredentials.user || '';
	_credentials.password = newCredentials.password || '';
	_credentials.database = newCredentials.database || '';
};

exports.connect = function (callback) {
	var connection = mysql.createConnection({
		host : _credentials.host,
		user : _credentials.user,
		password : _credentials.password,
		database : _credentials.database
	});

	connection.connect(function (err) {
		callback(err, connection)
	});
};


// Run a query against the database
exports.runQuery = function(queryLiteral, params, callback, errorCallback) {
    if (errorCallback == undefined) {
        var errorCallbackEffective = defaultErrorHandler;
    } else {
        var errorCallbackEffective = errorCallback;
    }

    exports.connect(function (error, connection) {
        if (error) {
            errorCallbackEffective(error);
            return;
        }

        connection.query(queryLiteral, params, function(error, results) {
            if (error) {
                errorCallbackEffective(error);
            } else {
                callback(results);
            }
        });
    });
}

var defaultErrorHandler = function(error) {
    // TODO something more useful
    console.log("Database error: " + error);
}
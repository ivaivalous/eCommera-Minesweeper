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
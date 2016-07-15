var path = require('path');
var express = require('express');
var handlebars = require('hbs');
var handlebarsHelpers = require('./handlebarsHelpers');

// For parsing request bodies
var bodyParser = require('body-parser');

// This loads environment variables from the local config.js file.
// This is a simple alternative to command line arguments, or bash 
// scripts that export variables or jenkins/travis configuration
var config = require('./config');

// initialize the database module
var database = require('./database');
database.setCredentials({
	host : config.database.host,
	user : config.database.user,
	password : config.database.password,
	database : config.database.database
});

// Use for JWT-based authentication
var authentication = require('./authentication');

// create the server web application
var app = express();
app.set('port', config.port || 3000);

// Allow parsing HTTP POST bodies
app.use(bodyParser.urlencoded({ extended: true }));

// the view model intercepts all requests and adds commonly used view 
// data for the templates (such as texts, session, users, etc.)
// (like pdict for Demandware)
app.use(require('./middleware/viewModel'));

// set the dynamic routings to use and the path for static files
app.use(require('./middleware/router'));
app.use(express.static('public')); // use the 'public' folder

// set handlebars as templating engine
app.set('view engine', 'html');
app.engine('html', handlebars.__express);

// precompile and register partial views
handlebars.registerPartials('./views/partials');

// start the server and listen to the configured port
app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*
@TODO:
- print detailed errors when in development environment https://github.com/expressjs/errorhandler
- use a json file for static texts?
*/
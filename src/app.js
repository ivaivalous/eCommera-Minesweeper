var path = require('path');
var express = require('express');
var handlebars = require('hbs');
var handlebarsHelpers = require('./handlebarsHelpers');
var session = require('express-session');

// For parsing request bodies
var bodyParser = require('body-parser');

// This loads environment variables from the local config.js file.
// This is a simple alternative to command line arguments, or bash 
// scripts that export variables or jenkins/travis configuration
var config = require('./config');
var auth = require('./authentication');

// create the server web application
var app = express();
app.set('port', config.port || 3000);

// Allow parsing HTTP POST bodies
app.use(bodyParser.urlencoded({extended : true}));

//Initialize and set the session
app.use(
    session({
        key: "sessionCookie",
        resave: true,
        saveUninitialized: true,
        secret: config.session.secret,
        cookie: { maxAge: config.session.cookieMaxAge }
    })
);

// the view model intercepts all requests and adds commonly used view 
// data for the templates (such as texts, session, users, etc.)
// (like pdict for Demandware)
app.use(require('./middleware/viewModel'));

// set the dynamic routings to use and the path for static files
app.use(express.static('public')); // use the 'public' folder
app.use(require('./middleware/router'));

// set handlebars as templating engine
app.set('view engine', 'html');
app.engine('html', handlebars.__express);

// precompile and register partial views in this folder
handlebars.registerPartials('./views/partials');

// start the server and listen to the configured port
app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

/*
@TODO:
- print detailed errors when in development environment
https://github.com/expressjs/errorhandler
- use a json file for static texts?
*/

if (config.environment === 'development') {
	app.use(function(req, res){
		res.status(404).send({ error: 'Not found! :(' });
	});
}
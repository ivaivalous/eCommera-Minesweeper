var path = require('path');
var express = require('express');
var handlebars = require('hbs');

// This loads environment variables from the local config.js file.
// This is a simple alternative to command line arguments, or bash 
// scripts that export variables or jenkins/travis configuration
var config = require('./config');

// create the server web application
var app = express();
app.set('port', config.port || 3000);

// set the dynamic routings to use and the path for static files
var router = require('./controllers/router');
app.use(router);
app.use(express.static('public'));

// set handlebars as templating engine
app.set('view engine', 'html');
app.engine('html', handlebars.__express);

// start the server
app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*
@TODO:
- consider a gitignored config.js file for all configurations
- print detailed errors when in development environment https://github.com/expressjs/errorhandler
- use a json file for static texts?
*/
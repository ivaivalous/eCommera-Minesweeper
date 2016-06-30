var express = require('express');
var router = express.Router();

// load/require controller files and bind them to specific paths/routes and HTTP methods

// homepage
var homeController = require('./homeController');
router.get('/', homeController.show);

// games
var gamesController = require('./gamesController');
router.get('/games', gamesController.show);

module.exports = router;
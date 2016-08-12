var express = require('express');
var router = express.Router();

// load/require controller files and bind them to specific paths/routes and HTTP methods

// homepage
var homeController = require('../controllers/homeController');
router.get('/', homeController.show);
router.get('/logout', homeController.logout);
router.get('/dashboard', homeController.dashboard);
router.get('/ranking', homeController.ranking);

var accountController = require('../controllers/accountController');

// Login
router.get('/login', accountController.loginPage);
router.post('/login', accountController.login);

// Registration
router.get('/register', accountController.registerPage);
router.post('/register', accountController.register);


var accountController = require('../controllers/accountController');
router.get('/user/:id', accountController.profile); // visit a user's public profile
router.get('/account', accountController.show); //change password page
router.post('/account', accountController.change); //the actual change of password 

// game
var gameController = require('../controllers/gameController');
router.get('/host', gameController.create);

// game communication
var games = {};
var commControler = require('../controllers/gameCommunicationController');
router.get('/list', commControler.listGames);
router.post('/create', commControler.createGame);
router.get('/play/:gameId', commControler.joinGame);
router.get('/status/:gameId', commControler.getStatus);
router.post('/move', commControler.makeMove);
router.get('/game/update/:id', gameController.updateState);
router.get('/game/click/:game_id/:x/:y', gameController.click);


// Default handler for 404 requests:
// if the request was not handled by any router above (or by the static file 
// service) then return 404
router.get('*', homeController.notFound);

module.exports = router;
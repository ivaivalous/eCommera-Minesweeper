var express = require('express');
var router = express.Router();

var homeController = require('../controllers/homeController');
var accountController = require('../controllers/accountController');
var gameController = require('../controllers/gameController');

// load/require controller files and bind them to specific paths/routes and HTTP methods

// homepage
router.get('/', homeController.show);
router.get('/logout', homeController.logout);
router.get('/dashboard', homeController.dashboard);
router.get('/ranking', homeController.ranking);

// Login
router.get('/login', accountController.loginPage);
router.post('/login', accountController.login);
router.post('/facebookLogin', accountController.facebookLogin);

// Registration
router.get('/register', accountController.registerPage);
router.post('/register', accountController.register);

// A user profile page, with stats and avatar
router.get('/user/:id', accountController.profile);
// The update account page
router.get('/account', accountController.show);
// Actual user update account requests go here
router.post('/account', accountController.change);

// game communication
router.get('/list', authenticated(gameController.listGames));
router.post('/create', authenticated(gameController.createGame));
router.get('/play/:gameId', authenticated(gameController.joinGame));
router.post('/start', authenticated(gameController.startGame));
router.get('/status/:gameId', authenticated(gameController.getStatus));
router.post('/move', authenticated(gameController.makeMove));

// Verify that the user issuing a request has been authenticated
function authenticated(fn) {
    return function (request, response) {
        try {
            gameController.validateRequest(request);
            fn(request, response);

        } catch (error) {
            response.status(401);
            response.json({error: 401});

            return;
        }
    };
}

// Default handler for 404 requests:
// if the request was not handled by any router above (or by the static file 
// service) then return 404
router.get('*', homeController.notFound);

module.exports = router;
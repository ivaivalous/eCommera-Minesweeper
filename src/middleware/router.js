var express = require('express');
var router = express.Router();

var homeController = require('../controllers/homeController');
var accountController = require('../controllers/accountController');
var gameController = require('../controllers/gameController');
var commControler = require('../controllers/gameCommunicationController');

// load/require controller files and bind them to specific paths/routes and HTTP methods

// homepage
router.get('/', homeController.show);
router.get('/logout', homeController.logout);
router.get('/dashboard', homeController.dashboard);
router.get('/ranking', homeController.ranking);

// Login
router.get('/login', accountController.loginPage);
router.post('/login', accountController.login);

// Registration
router.get('/register', accountController.registerPage);
router.post('/register', accountController.register);

router.get('/user/:id', accountController.profile); // visit a user's public profile
router.get('/account', accountController.show); //change password page
router.post('/account', accountController.change); //the actual change of password 

// game
router.get('/host', gameController.create);

// game communication
router.get('/list', authenticated(commControler.listGames));
router.post('/create', authenticated(commControler.createGame));
router.get('/play/:gameId', authenticated(commControler.joinGame));
router.post('/start', authenticated(commControler.startGame));
router.get('/status/:gameId', authenticated(commControler.getStatus));
router.post('/move', authenticated(commControler.makeMove));

router.get('/game/update/:id', gameController.updateState);
router.get('/game/click/:game_id/:x/:y', gameController.click);

// Verify that the user issuing a request has been authenticated
function authenticated(fn) {
    return function (request, response) {
        try {
            commControler.validateRequest(request);
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
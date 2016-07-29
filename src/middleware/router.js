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

/* @TODO:
// account
var accountController = require('../controllers/accountController');
router.get('/account', accountController.show); // account landing page?
router.get('/account/logout', accountController.logout); // log out and redirect

*/
var accountController = require('../controllers/accountController');
router.get('/user/:id', accountController.profile); // visit a user's public profile

// game
var gameController = require('../controllers/gameController');
router.get('/host', gameController.create);
router.get('/join/:id', gameController.join);

module.exports = router;
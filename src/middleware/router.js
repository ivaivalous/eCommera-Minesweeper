var express = require('express');
var router = express.Router();

// load/require controller files and bind them to specific paths/routes and HTTP methods

// homepage
var homeController = require('../controllers/homeController');
router.get('/', homeController.show);
router.get('/dashboard', homeController.dashboard);
router.get('/ranking', homeController.ranking);

/* @TODO:
// account
var accountController = require('../controllers/accountController');
router.get('/account', accountController.show); // account landing page?
router.get('/account/logout', accountController.logout); // log out and redirect
router.get('/user/:id', accountController.profile); // visit a user's public profile

router.get('/account/login', accountController.login); // get the form page
router.post('/account/login', accountController.loginSubmit); // submit the form

router.get('/account/register', accountController.create); // get the form page
router.post('/account/register', accountController.createSubmit); // submit the form
*/

// game
var gameController = require('../controllers/gameController');
router.get('/host', gameController.create);
router.get('/join/:id', gameController.join);

module.exports = router;
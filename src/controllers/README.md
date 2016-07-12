# Controllers

These files handle the requests to a specific app area. They are Node.js modules that expose functions that can handle request/response objects specific to an action and render a response.

	// @ /controllers/myController.js
	
	function saveToDataBase (stuff) { ... }

	exports.myAction = function (request, response) {
		// set the page's title in the viewModel
		response.viewModel.title = 'Minesweeper games dashboard';

		// render the HTML template for the response by populating it with the viewModel data
		response.render('home/dashboard', response.viewModel);
	};

	exorts.myPostAction = function (request, response) {
		// do stuff with the POST data and redirect (301) back to root
		saveToDataBase(request.body);
		response.redirect('/');
	};

The routing of a given request to a specific controller happens in `/middleware/router.js`.

	// @ /middleware/router.js
	
	ar express = require('express');
	var router = express.Router();
	var myController = require('../controllers/myController');

	// HTTP GET requests to the app root will be handled by the myController's myAction action
	router.get('/', myController.myAction);
	router.post('/', myController.myPostAction);
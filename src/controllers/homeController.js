var ViewModel = require('../models/viewModel');

exports.show = function (request, response) {
	var viewModel = new ViewModel();

	viewModel.header.menuItems.home.current = true;
	viewModel.title = 'Welcome to our Minesweeper game!';
	
	response.render('home/index', viewModel);
}
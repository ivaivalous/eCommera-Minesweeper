var ViewModel = require('../models/viewModel');
var games = [
	{
		host : 'Batman',
		players : 3,
		created : '14:22'
	},
	{
		host : 'Boris Johnson',
		players : 1,
		created : '00:12'
	},
	{
		host : 'johndoe',
		players : 7,
		created : '22:33'
	}
];

exports.show = function (request, response) {
	var viewModel = new ViewModel();
	
	viewModel.header.menuItems.games.current = true;
	viewModel.title = 'This is a list of all games you can join:';
	
	// @TODO: get these from the DB
	viewModel.games = games;

	response.render('games/index', viewModel);
};
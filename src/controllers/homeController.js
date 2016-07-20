var db = require('../database');

exports.show = function (request, response) {
	// @TODO: get session data
	// if user is logged in redirect them to the dashboard
	if(false){
		response.redirect('/dashboard');
	}

	// set this page's menu item in the header as active/current
	response.viewModel.header.menuItems.home.current = true;

	// put a title for the page
	response.viewModel.title = 'Welcome to our Minesweeper game!';
	
	response.render('home/index', response.viewModel);
};

exports.dashboard = function (request, response) {
	var sql = ''+
		'SELECT '+
			'g.id, '+
			'u.id as \'user_id\', '+
			'u.display_name, '+
			'g.game_start_time '+
		'FROM games g '+
		'JOIN users u '+
			'ON u.id = g.host_user_id '+
		'WHERE g.game_finish_time IS NULL'; // i.e games that are not finished yet

	db.query(sql, function(err, rows) {
		if(err){
			// render error page
			response.viewModel.error = err;
			response.render('error/500', response.viewModel);
			return;
		}

		// transform the query results and set them in the viewModel
		response.viewModel.games = [];
		for(var i = 0; i < rows.length; i++){
			var row = rows[i];
			response.viewModel.games.push({
				id : row.id,
				userId : row.user_id,
				host : row.display_name,
				created : new Date(row.game_start_time).toLocaleTimeString()
			});
		}

		// set this page's menu item in the header as active/current
		response.viewModel.header.menuItems.home.current = true;

		// view template data
		response.viewModel.title = 'Minesweeper games dashboard';
		response.viewModel.createGameLink = '/host';
		response.viewModel.joinGameLink = '/join/';
		response.viewModel.profileLink = '/user/';
		
		response.render('home/dashboard', response.viewModel);
	});
};

exports.ranking = function (request, response) {
	// @TODO: get data from DB
	response.viewModel.users = [
		{
			id : 1,
			name : 'Lorem',
			score : 400
		},
		{
			id : 2,
			name : 'Ipsum',
			score : 300
		},
		{
			id : 3,
			name : 'Dolor',
			score : 200
		},
		{
			id : 4,
			name : 'Sit Amet',
			score : 100
		}
	];

	// set this page's menu item in the header as active/current
	response.viewModel.header.menuItems.ranking.current = true;
	response.viewModel.profileLink = '/user/';

	response.render('home/ranking', response.viewModel);
};
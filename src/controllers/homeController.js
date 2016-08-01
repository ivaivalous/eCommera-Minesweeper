var db = require('../database');

exports.show = function (request, response) {
	// if user is logged in redirect them to the dashboard
	if(request.session.isUserLogged){
		response.redirect('/dashboard');
		return;
	}

	// set this page's menu item in the header as active/current
	response.viewModel.header.menuItems.home.current = true;

	// put a title for the page
	response.viewModel.title = 'eCommera Minesweeper';
	
	response.render('home/index', response.viewModel);
};

exports.dashboard = function (request, response) {
	// if user is not logged in redirect them to homepage
	if(!request.session.isUserLogged){
		response.redirect('/');
		return;
	}

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

	db.query(sql, [], function(err, rows) {
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
		response.viewModel.header.menuItems.dashboard.current = true;

		// view template data
		response.viewModel.title = 'Minesweeper games dashboard';
		response.viewModel.createGameLink = '/host';
		response.viewModel.joinGameLink = '/join/';
		response.viewModel.profileLink = '/user/';
		
		response.render('home/dashboard', response.viewModel);
	});
};

exports.ranking = function (request, response) {
	// if user is not logged in redirect them to homepage
	if(!request.session.isUserLogged){
		response.redirect('/');
		return;
	}

	var sql = 'SELECT id, display_name FROM users';
	db.query(sql, [], function(err, rows) {
		if(err){
			// render error page
			response.viewModel.error = err;
			response.render('error/500', response.viewModel);
			return;
		}

		response.viewModel.users = [];
		for(var i = 0; i < rows.length; i++){
			var row = rows[i];
			response.viewModel.users.push({
				id : row.id,
				name : row.display_name,
				score : (rows.length - i) * 100 // @TODO: get real scores
			});
		}

		// set this page's menu item in the header as active/current
		response.viewModel.header.menuItems.ranking.current = true;
		response.viewModel.profileLink = '/user/';
		
		// view template data
		response.viewModel.title = 'High scores';

		response.render('home/ranking', response.viewModel);
	});
};

exports.logout = function (request, response) {
	request.session.destroy();
	response.redirect('/');
};

exports.notFound = function (request, response) {
	response.status(404);

	// respond with html page
	if(request.accepts('html')){
		response.viewModel.title = 'Error 404';
		response.viewModel.error = request.originalUrl;
		response.render('error/404', response.viewModel);
		return;
	}

	// respond with json
	if(request.accepts('json')){
		response.send({ error: 'Not found' });
		return;
	}

	// default to plain-text. send()
	response.type('txt').send('Not found');
}

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
	// @TODO: get data from DB
	response.viewModel.games = [
		{
			id : 1,
			host : 'Batman',
			players : 3,
			created : '14:22'
		},
		{
			id : 2,
			host : 'Boris Johnson',
			players : 1,
			created : '00:12'
		},
		{
			id : 3,
			host : 'johndoe',
			players : 7,
			created : '22:33'
		}
	];

	// set this page's menu item in the header as active/current
	response.viewModel.header.menuItems.home.current = true;

	// view template data
	response.viewModel.title = 'Minesweeper games dashboard';
	response.viewModel.createGameLink = '/host';
	response.viewModel.joinGameLink = '/join/';
	
	response.render('home/dashboard', response.viewModel);
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
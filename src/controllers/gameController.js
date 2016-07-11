var util = require('util');

exports.create = function (request, response) {
	response.viewModel.title = '@TODO: create a new game';
	response.render('game/index', response.viewModel);

	// DEBUG
	response.viewModel.debug(util.inspect(response.viewModel));
};

exports.join = function (request, response) {
	response.viewModel.title = '@TODO: join a game with ID ' + request.params.id;
	response.render('game/index', response.viewModel);

	// DEBUG
	response.viewModel.debug(util.inspect(response.viewModel));
};
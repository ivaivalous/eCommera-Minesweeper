var db = require('../database');
var queries = require('../queries');

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

    var returnGamesPlayed = function(error, rows) {
        response.viewModel.gamesPlayed = [];
        response.viewModel.totalScore = 0;

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            response.viewModel.totalScore += row.score;

            response.viewModel.gamesPlayed.push({
                started : row["game_start_time"],
                ended : row["game_finish_time"],
                score : row.score
            });
        }

        // Set this page's menu item in the header as active/current
        response.viewModel.header.menuItems.dashboard.current = true;

        // View template data
        response.viewModel.title = 'Minesweeper Games Dashboard';
        response.render('home/dashboard', response.viewModel);
    };

    db.query(
    	queries.queries.getPlayedGames,
    	[request.session.userId], returnGamesPlayed);
};

exports.ranking = function (request, response) {
    // if user is not logged in redirect them to homepage
    if(!request.session.isUserLogged){
        response.redirect('/');
        return;
    }

    var returnRanking = function(err, rows) {
        response.viewModel.users = [];

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

            response.viewModel.users.push({
                id : row.id,
                name : row.display_name,
                score : row.score
            });
        }

        // Set this page's menu item in the header as active/current
        response.viewModel.header.menuItems.ranking.current = true;
        response.viewModel.profileLink = '/user/';
        
        // View template data
        response.viewModel.title = 'High scores';

        response.render('home/ranking', response.viewModel);
    };

    db.query(queries.queries.getPlayersByScore, [], returnRanking);
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

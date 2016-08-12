var db = require('../database');
var auth = require('../authentication');
var queries = require('../queries');
var config = require('../config');

var initialStateMaster = [];

exports.create = function (request, response) {
	response.viewModel.title = '@TODO: create a new game';
	response.render('game/index', response.viewModel);

	// DEBUG
	response.viewModel.debug(response.viewModel);
};

exports.join = function (request, response) {
	response.viewModel.title = '@TODO: join a game with ID ' + request.params.id;
	response.render('game/index', response.viewModel);

	// DEBUG
	response.viewModel.debug(response.viewModel);
};

// Creates initial & current board and saves it in the DB
// @TODO don't save it in the DB
function createGame(request, response) {

	// @TODO make these either customer-configurable or choise options
	var gridWidth = 10;
	var gridHeight = 10;
	var minesCount = 10;
	response.viewModel.title = "Welcome player!";	
	

	response.viewModel.currentState = generateInitialBoard(gridWidth, gridHeight, minesCount);
	
	response.render('game', response.viewModel);
	// response.viewModel.debug(response.viewModel);
}


// initial board
function generateInitialBoard(a, b, n) {

	var initialGrid = createMinedGrid(a, b, n);
	
	return createInitialBoard(a, b, initialGrid);
}

// creates initial grid with mines only
function createMinedGrid(a, b, n) {

	var x, y = 0;
	var grid = [];

	// create empty matrix
	for(var i = 0; i < a; i++){
		grid[i] = [];
		for(var j = 0; j < b; j++){
			grid[i][j] = 0;
		}
	}

	// set mines at random spots
	// keeps generating until n 
	// different spots are set
	while(n) {
		x = getRandomInt(0, a);
		y = getRandomInt(0, b);

		if(grid[x][y] == 0) {
			grid[x][y] = 9;
			n--;
		}
	}
	initialStateMaster = grid;
	return grid;
}

// creates game board
// 9 means mine
// 1-8 indicates nearby mines
// 0 means no nearby mines
// -1 means not opened
function createInitialBoard(a, b, grid) {
	var nearbyMinesCount = 0;
	var currentState = [];

	for(var i = 0; i < a; i++) {
		currentState[i] = [];
		for(var j = 0; j < b; j++) {
				
			// reset mines counter
			nearbyMinesCount = 0;
			currentState[i][j] = -1;

			if(grid[i][j] != 9) {
				
				// @TODO check if parseInt necessary for i+1
				for(var n = i-1; n <= i+1; n++) {
					for(var m = j-1; m <= j+1; m++) {
						if(typeof grid[n] != 'undefined' && grid[n][m] == 9) {
							nearbyMinesCount++;
						} 
					}
				} 
				grid[i][j] = nearbyMinesCount;
			}
		}
	}

	var params = [
		JSON.stringify(grid),
		JSON.stringify(currentState)
	]

	// save in DB
	// @TODO uncomment to create game record in the DB
	/*
	startGame(params, function(err) {
		if(err) {
			console.log(err);
            return;
        }

        console.log("game is created");
	});
	*/
	
	return currentState;
}

// random int generator for mines spots
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


// @TODO: create JSON with current board state based on initial board, current state and click coordinates
function updateCurrentState(initialBoard, currentState, clickCoord) {

}

function update(request, response) {
	var gameID = request.params.id;

    getGameByID(gameID, function(err, result) {
            
		if(err || result.length == 0) {
			// render error page
			response.viewModel.error = "This game doesn't exist!";
			response.render('error/500', response.viewModel);
			return;
		}

		var currentStateString = result[0].current_state;
		
		response.viewModel.currentState = JSON.parse(currentStateString);
		response.render('game', response.viewModel);
	});
}

function startGame(data, callback) {
	db.query(queries.queries.startGame, data, callback);
};

function click(request, response) {
	var gameID = request.params.game_id;
	var xCoord = request.params.x;
	var yCoord = request.params.y;

	getGameByID(gameID, function(err, result) {
		response.viewModel.title = "Update after click";

		if(err || result.length == 0) {
			// render error page
			console.log(err);
			response.viewModel.error = "This game doesn't exist!";
			response.render('error/500', response.viewModel);
			return;
		}

		if(result) {
			var initialState = JSON.parse(result[0].initial_state);
			var currentState = JSON.parse(result[0].current_state);
			var gameEnded = Date.parse(result[0].game_finish_time) || 0;
			
			if(!gameEnded) {
				switch(initialState[xCoord][yCoord]) {
					case 9: // mine, stop game
						// endGame();
						currentState[xCoord][yCoord] = initialState[xCoord][yCoord];
						currentState = mapCurrentState(initialState, currentState);
						response.viewModel.title = "Game Over! You just stepped on a mine!";
						break;
					case 0: // open wide & update
						currentState = openEmptySector(initialState, currentState, xCoord, yCoord);
						currentState = mapCurrentState(initialState, currentState);
						
						response.viewModel.title = "Lucky U! Large sector is opened!";
						break;
					default: // update
						currentState[xCoord][yCoord] = initialState[xCoord][yCoord];
						currentState = mapCurrentState(initialState, currentState);

						// updateGame(gameID, JSON.stringify(currentState), function(err, result) {
		
						// 	if(err || result.length == 0) {
						// 		// render error page
						// 		response.viewModel.title = "This game doesn't exist!";
						// 		// response.render('error/500', response.viewModel);
						// 		return;
						// 	}
							
						// });
				}
			}
		}
		response.viewModel.currentState = currentState;
		response.render('game', response.viewModel);
	} );
}

function getGameByID(gameID, callback) {
	return db.query(queries.queries.getGameByID, gameID, callback);
}

function endGame(gameID, currentState) {
	
	return db.query(queries.queries.endGame, gameID, function(err, result) {
		
		if(err || result.length == 0) {
			// render error page
			response.viewModel.error = "This game doesn't exist!";
			response.render('error/500', response.viewModel);
			return;
		}

		if(result) {
			console.log("game ended");
		}
	});
}

function updateGame(currentState, gameID, callback) {

	// console.log(initialStateMaster);
	var params = [gameID, currentState];

	return db.query(queries.queries.updateGameCurrStatus, params, callback);
}

function openEmptySector(initialState, currentState, xCoord, yCoord) {

	var x = parseInt(xCoord);
	var y = parseInt(yCoord);

	for (var xIndex = x - 1; xIndex <= x + 1; xIndex++) {
		for (var yIndex = y - 1; yIndex <= y + 1; yIndex++) {
			if (typeof initialState[xIndex] != 'undefined' && typeof initialState[xIndex][yIndex] != 'undefined') {

				if (initialState[xIndex][yIndex] == 0) {
					if(currentState[xIndex][yIndex] < 0) {
						currentState[xIndex][yIndex] = 1;
						openEmptySector(initialState, currentState, xIndex, yIndex);
					}
				} else {
					currentState[xIndex][yIndex] = 1;
				}
			}
		}
	}

	return currentState;
}

function mapCurrentState(initialState, currentState) {
	
	for(var i = 0; i < initialState.length; i++) {

		for(var j = 0; j < initialState[i].length; j++) {
			if(currentState[i][j] > 0) {
				currentState[i][j] = initialState[i][j];
			}
		}
	}

	return currentState;
}

exports.createGame = createGame;
exports.click = click;
exports.updateState = update;

// @TODO: create game start form with options

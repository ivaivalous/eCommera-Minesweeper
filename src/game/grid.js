/*
    The game board is represented by a grid.
    Create game grids and handle the game board state -
    which grid cells are open, which ones contain mines, etc.
*/

var db = require('../database');
var auth = require('../authentication');
var config = require('../config');


// initial board
function generateInitialMap(sizeX, sizeY, minesCount) {
    return generateUnexposedGrid(sizeX, sizeY, minesCount);
}

// Build an empty game grid containing no mines
function buildEmptyGrid(sizeX, sizeY) {
    var grid = [];

    Array.prototype.isMine = function(x, y) {
        return grid[y][x].isMine;
    };

    for(var y = 0; y < sizeY; y++) {
        grid[y] = [];

        for(var x = 0; x < sizeX; x++) {
            grid[y][x] = getEmptyCell();
        }
    }

    return grid;
}

// Creates initial grid with mines only
function generateUnexposedGrid(sizeX, sizeY, numberOfMines) {
    var x = 0;
    var y = 0;
    var grid = buildEmptyGrid(sizeX, sizeY);
    var minesToAdd = numberOfMines;

    // set mines at random spots
    // keeps generating until numberOfMines 
    // different spots are set
    while(minesToAdd > 0) {
        x = getRandomInt(0, sizeX);
        y = getRandomInt(0, sizeY);

        if (!grid[y][x].isMine) {
            grid[y][x] = getMineCell();
            minesToAdd--;
        }
    }

    return grid;
}

function getLeftNeighbourIndex(x) {
    // When counting or expanding neighboring mines,
    // you'd want to start at start = (current index - 1).
    // Start might be -1 if you are looking at x=0's neighbors.
    // Return a safe left index.

    return x === 0 ? 0 : x - 1;
}

function getRightNeighbourIndex(grid, x) {
    // When counting or expanding neighboring mines,
    // you'd want to finish at end = (current index + 1).
    // Start might be greater than the row's length
    // if you are looking at x=row.length's neighbors.
    // Return a safe right index.

    // We use grid[0] as all grid rows are equal in length.

    return x < grid[0].length - 1 ? x + 1 : x;
}

function getTopNeighbourIndex(y) {
    // When counting or expanding neighboring mines,
    // you'd want to start at start = (current index - 1).
    // Start might be -1 if you are looking at y=0's neighbors.
    // Return a safe top index.

    return y === 0 ? 0 : y - 1;
}

function getBottomNeighbourIndex(grid, y) {
    // When counting or expanding neighboring mines,
    // you'd want to finish at end = (current index + 1).
    // Start might be greater than the number of rows
    // if you are looking at y=grid.length's neighbors.
    // Return a safe top index.

    return y < grid.length - 1 ? y + 1 : y;
}

// Find the number of fields adjacent to a cell
// that contain a mine
var countNeighbourMines = function(grid, x, y) {
    var mineCount = 0;

    var startingYIndex = getTopNeighbourIndex(y);
    var endingYIndex = getBottomNeighbourIndex(grid, y);

    var startingXIndex = getLeftNeighbourIndex(x);
    var endingXIndex = getRightNeighbourIndex(grid, x);
  
    for (var yIndex = startingYIndex; yIndex <= endingYIndex; yIndex++) {
        for (var xIndex = startingXIndex; xIndex <= endingXIndex; xIndex++) {
            if (grid[yIndex][xIndex].isMine) {

                mineCount++;
            }
        }
    }
  
    return mineCount;
};

// random int generator for mines spots
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var clickCell = function(grid, x, y, handleMineClick) {
    var neighbouringMineCount = 0;

    // Don't let a player open a cell that has already been opened
    if (grid[y][x].isOpen) {
        return grid;
    }
    grid[y][x].isOpen = true;

    if (grid[y][x].isMine) {
        // Let the caller execute custom logic such as scoring and game over
        handleMineClick();
    }
    else {
        neighbouringMineCount = countNeighbourMines(grid, x, y);
    
        if (neighbouringMineCount === 0) {
            grid = openAdjacentSpaces(grid, x, y);
        }
        else {
            grid[y][x].neighboringMineCount = neighbouringMineCount;
        }
    }

    return grid;
};

var openAdjacentSpaces = function(grid, x, y) {
    var startingYIndex = getTopNeighbourIndex(y);
    var endingYIndex = getBottomNeighbourIndex(grid, y);

    var startingXIndex = getLeftNeighbourIndex(x);
    var endingXIndex = getRightNeighbourIndex(grid, x);

    for (var yIndex = startingYIndex; yIndex <= endingYIndex; yIndex++) {
        for (var xIndex = startingXIndex; xIndex <= endingXIndex; xIndex++) {
            if (!grid[yIndex][xIndex].isOpen) {
                grid = clickCell(grid, xIndex, yIndex);
            }
        }
    }

    return grid;
};

// Get a representation of the game grid that is safe to display
// to players: no unopened cells should expose what is hidden underneath.
var getUserViewGrid = function(grid) {
    var safeGrid = [];

    // Iterate rows
    for (var yIndex = 0; yIndex < grid.length; yIndex++) {
        // Iterate columns
        for (var xIndex = 0; xIndex < grid[yIndex].length; xIndex++) {
            safeGrid = addUserViewCell(grid, safeGrid, xIndex, yIndex);
        }
    }

    return safeGrid;
};

// Count the number of open cells that do not neighbor a mine.
// Used in score calculation.
var countEmptyOpenCells = function(grid) {
    var simpleGrid = getUserViewGrid(grid);
    var emptyOpenCount = 0;

    for (var i = 0; i < simpleGrid.length; i++) {
        if (simpleGrid[i].neighboringMineCount === 0) {
            emptyOpenCount++;
        }
    }

    return emptyOpenCount;
};

// Count unopen mine cells
var countUnopenCells = function(grid) {
    var mineCount = 0;
    var emptyCellCount = 0;

    // Iterate rows
    for (var yIndex = 0; yIndex < grid.length; yIndex++) {
        // Iterate columns
        for (var xIndex = 0; xIndex < grid[yIndex].length; xIndex++) {
            var cell = grid[yIndex][xIndex];

            if (cell.isOpen) {
                // Ignoring open cells
                continue;
            }

            if (cell.isMine) {
                mineCount++;
            } else {
                emptyCellCount++;
            }
        }
    }

    return {
        mineCount: mineCount,
        emptyCellCount: emptyCellCount
    };
};

// Users should view all unopened cells as closed, containing no mine
// and with zero neighboring mines.
var addUserViewCell = function(grid, safeGrid, x, y) {
    var gameCell = grid[y][x];

    if (!gameCell.isOpen) {
        return safeGrid;
    }

    gameCell.x = x;
    gameCell.y = y;

    safeGrid.push(gameCell);
    return safeGrid;
};

var getEmptyCell = function() {
    return cell(false, false);
};

var getMineCell = function() {
    return cell(true, false);
};

// Map cell representation
var cell = function(isMine, isOpen) {
    return {
        isMine: isMine,
        isOpen: isOpen,
        neighboringMineCount: 0
    };
};

var generateMap = function(sizeX, sizeY, numberOfMines) {
    return generateInitialMap(sizeX, sizeY, numberOfMines);
};

var makeMove = function(grid, posX, posY, handleMineClick) {
    return clickCell(grid, posX, posY, handleMineClick);
};

var getUserMapRepresentation = function(grid) {
    return getUserViewGrid(grid);
};

// gameController API
exports.generateMap = generateMap;
exports.makeMove = makeMove;
exports.getUserMapRepresentation = getUserMapRepresentation;
exports.countUnopenCells = countUnopenCells;
exports.countEmptyOpenCells = countEmptyOpenCells;
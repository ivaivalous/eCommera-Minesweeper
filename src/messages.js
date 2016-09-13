// This file contains text strings for user-facing messages

"use strict";

var error = {
    gameUnavailable: "This game is no longer available.",
    gameRoomFull: "This game room is full",
    gameRoomJoinGeneral: "Could not join this game. Please try again later",
    maxGameCountReached: "The maximum allowed number of games was reached",
    gameGridXDimensionOutOfRange: "The X dimension is out of bounds",
    gameGridYDimensionOutOfRange: "The Y dimension is out of bounds",
    gameGridMineCountOutOfRange: "The mine count is out of bounds",
    playersNumberOutOfRange: "Too many or too few players",
    badRoomName: "This room name is not valid",
    playerInTooManyGames: "Joined too many games",
    statusGetNotAllowed: "Cannot get status of a game not participating in",
    illegalMove: "Illegal move"
};

var validation = {
    registrationEmail: "Please check if this is the right email address",
    registrationPassword: (
        "Please make sure your password contains " + 
        "lower and uppercase letters, as well as digits and " +
        "special characters"
    ),
    registrationName: "Please use a display name at least 2 characters long"
};

module.exports = {};
module.exports.error = error;
module.exports.validation = validation;
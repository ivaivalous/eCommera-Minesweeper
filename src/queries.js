/*
    A list of MySQL queries used throughout the game.
*/

'use strict';

var queries = {};
exports.queries = queries;

queries.getCustomer = "SELECT * FROM users WHERE email = ?";
queries.register = (
    "INSERT INTO users (email, password, salt, display_name, active) " +
    "VALUES (?, ?, ?, ?, 1)"
);

queries.getSocialNetworkUser = "SELECT * FROM users WHERE social_network_id = ?";

queries.registerSocialNetworkUser = (
    "INSERT INTO users (email, password, salt, " +
    "display_name, active, social_network_user, social_network_id) " +
    "VALUES (?, ?, ?, ?, 1, 1, ?)"
);

queries.transformToSocialNetworkUser = (
    "UPDATE user SET display_name = ?, social_network_id = ?, " +
    "social_network_user = 1 WHERE email = ?"
);

queries.updateUserBasicInfo = (
    "UPDATE user SET email = ?, display_name = ? " +
    "WHERE email = ?"
);

queries.getPlayerStats = (
    "SELECT DISTINCT " +
    "    users.display_name AS displayName, " +
    "    users.email, " +
    "    count(games_played.score) AS gamesPlayed, " +
    "    ROUND(AVG(games_played.score)) AS averageScore, " +
    "    MAX(games_played.score) AS bestScore, " +
    "    MIN(games_played.score) AS worstScore " +
    "FROM users JOIN games_played " +
    "ON users.id=games_played.user_id " +
    "WHERE id = ?;"
);

queries.findEmail = "SELECT COUNT(*) as count FROM users WHERE email = ?";
queries.getSalt = "SELECT salt FROM users WHERE email = ?";
queries.getGameByID = "SELECT * FROM games WHERE id = ?";
queries.startGame = (
    "INSERT INTO games (host_user_id, initial_state, current_state) " +
    "VALUES (11, ?, ?)"
);

queries.endGame = (
    "UPDATE games SET current_state = ?, last_updated = now(), " +
    "game_finish_time = now() WHERE id = ?"
);

queries.saveGame = (
    "INSERT INTO games " +
    "(private, host_user_id, number_of_players, game_start_time, game_finish_time) " +
    "VALUES (?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?))"
);

queries.registerPlayerScore = (
    "INSERT INTO games_played " +
    "(user_id, game_id, score) VALUES (?, ?, ?)"
);

queries.getUserTotalScore = (
    'SELECT SUM(score) AS "score" FROM games_played WHERE user_id = ?'
);

queries.getPlayedGames = (
    "SELECT DATE_FORMAT(games.game_start_time, '%H:%i:%s, %d. %m. %Y') as started, " +
    "DATE_FORMAT(games.game_finish_time, '%H:%i:%s, %d. %m. %Y') as ended, " +
    "games.number_of_players as players, " +
    "games_played.score FROM games JOIN games_played ON " +
    "games.id = games_played.game_id WHERE games_played.user_id = ?"
);

queries.getPlayersByScore = (
    "SELECT SUM(games_played.score) AS score, " +
    "users.id, users.display_name, users.email " +
    "FROM games_played JOIN users ON " +
    "users.id = games_played.user_id " +
    "GROUP BY games_played.user_id " +
    "ORDER BY score DESC"
);
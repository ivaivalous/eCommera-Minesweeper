exports.queries = {
    getCustomer: "SELECT * FROM users WHERE email = ?",
    register: (
        "INSERT INTO users (email, password, salt, display_name, active) " +
        "VALUES (?, ?, ?, ?, 1)"),
    findEmail: "SELECT COUNT(*) as count FROM users WHERE email = ?",
    getSalt: "SELECT salt FROM users WHERE email = ?",
    getGameByID: "SELECT * FROM games WHERE id = ?", 
    startGame: "INSERT INTO games (host_user_id, initial_state, current_state) VALUES (11, ?, ?)",
    updateGameCurrStatus: "UPDATE games SET current_state = ?, last_updated = now() WHERE id = ?",
    endGame: "UPDATE games SET current_state = ?, last_updated = now(), game_finish_time = now() WHERE id = ?"
}
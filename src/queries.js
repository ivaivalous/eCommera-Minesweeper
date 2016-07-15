exports.queries = {
    login: "SELECT * FROM users WHERE email = ? and password = ?",
    register: (
        "INSERT INTO users (email, password, salt, display_name, active) " +
        "VALUES (?, ?, ?, ?, 1)"),
    findEmail: "SELECT COUNT(*) as count FROM users WHERE email = ?",
    getSalt: "SELECT salt FROM users WHERE email = ?"
}
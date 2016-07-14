exports.queries = {
    login: "SELECT * FROM users WHERE email = ? and password = ?",
    register: (
        "INSERT INTO users (email, password, display_name, active) " +
        "VALUES (?, ?, ?, 1)")
}
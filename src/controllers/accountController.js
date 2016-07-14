var db = require('../database');
var auth = require('../authentication');
var queries = require('../queries');

exports.loginPage = function (request, response) {
    // If already logged in (JWT in request), redirect to dashboard
    //response.redirect('/dashboard');

    // Set navigation
    response.viewModel.header.menuItems.login.current = true;

    // TODO: Have the title read off a config file
    response.viewModel.title = 'Login - eCommera Minesweeper';
    response.render('login', response.viewModel);
}

exports.registerPage = function (request, response) {
    // If already logged in (JWT in request), redirect to dashboard
    //response.redirect('/dashboard');

    // Set navigation
    response.viewModel.header.menuItems.register.current = true;

    // TODO: Have the title read off a config file
    response.viewModel.title = 'Register - eCommera Minesweeper';
    response.render('register', response.viewModel);
}

exports.login = function (request, response) {
    // Login a user
    // Issue and return a JWT
    var email = request.body.email;
    var password = request.body.password;

    if (!isEmailValid(email)) {
        response.send({ success: false });
        return;
    }

    db.runQuery(
        queries.queries.login,
        [email, hashPassword(password)],
        function (results) {
            var respJson = (
                results.length ? {success: true} : {success: false});
            response.send(respJson);
        }
    );
}

exports.register = function (request, response) {
    var email = request.body.email;
    var displayName = request.body.displayName;
    var password = request.body.password;

    if (!validateRegisterInput(email, displayName, password)) {
        response.send({ success: false });
    } else {
        createUser(email, displayName, password);
        response.send({ success: true });
    }
}

function createUser(email, displayName, password) {
    db.runQuery(
        queries.queries.register,
        [email, hashPassword(password), displayName],
        function (results) {
            console.log("Inserted a new user.");
        }
    );
}

function hashPassword(password) {
    // TODO
    return password;
}

function validateRegisterInput(email, displayName, password) {
    return (isEmailValid(email) &&
        isDisplayNameValid(displayName) &&
            isPasswordValid(password));
}

function isEmailValid(email) {
    // Is the email a valid address?
    // Has the email already been taken?
    return true;
}

function isDisplayNameValid(displayName) {
    return true;
}

function isPasswordValid(password) {
    // Validate the password against a regular expression
    // to assert complexity
    return true;
}
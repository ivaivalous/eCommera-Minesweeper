var db = require('../database');
var auth = require('../authentication');
var queries = require('../queries');
var config = require('../config');

// Reguest the login page
exports.loginPage = function (request, response) {
    // If already logged in (JWT in request), redirect to dashboard
    //response.redirect('/dashboard');

    // Set navigation
    response.viewModel.header.menuItems.login.current = true;
    response.viewModel.title = 'Login - eCommera Minesweeper';
    response.render('login', response.viewModel);
}

// Request the register page
exports.registerPage = function (request, response) {
    // If already logged in (JWT in request), redirect to dashboard
    //response.redirect('/dashboard');

    // Set navigation
    response.viewModel.header.menuItems.register.current = true;

    // TODO: Have the title read off a config file
    response.viewModel.title = 'Register - eCommera Minesweeper';
    response.render('register', response.viewModel);
}

// Perform the actual login - on success return a JWT and the dashboard page
exports.login = function (request, response) {
    // Login a user
    // Issue and return a JWT
    var email = request.body.email;
    var password = request.body.password;

    if (!isEmailValid(email)) {
        response.viewModel.loginError = true;
        response.render('login/index', response.viewModel);
        return;
    }

    var tryLogin = function (saltResults) {
        var salt = saltResults[0].salt;

        db.runQuery(
            queries.queries.login,
            [email, auth.hashPassword(password, salt)],
            function (results) {
                if (results.length) {
                    var result = results[0];

                    // Create a JWT and return it with the viewModel
                    response.viewModel.jwt = auth.issueJwt(
                        result.email,
                        result['display_name']);

                    // TODO redirect to another page
                    response.render('login/success', response.viewModel);
                } else {
                    // Login failed
                    response.viewModel.loginError = true;
                    exports.loginPage(request, response);
                }
            }
        );
    };

    db.runQuery(queries.queries.getSalt, [email], tryLogin);
}

// Perform user registration. Return {success: true} if it went well
exports.register = function (request, response) {
    var email = request.body.email;
    var displayName = request.body.displayName;
    var password = request.body.password;

    if (!validateRegisterInput(email, displayName, password)) {
        response.send({ success: false });
    } else {
        ifEmailNotTaken(email, function() {
            createUser(email, displayName, password);
            response.send({ success: true });
        }, function () {
            response.send({ success: false });
        })
    }
}

function createUser(email, displayName, password) {
    var salt = auth.generateSalt();

    db.runQuery(
        queries.queries.register,
        [email, auth.hashPassword(password, salt), salt, displayName],
        function (results) {
            console.log("User " + email + " has been created");
        }
    );
}

function validateRegisterInput(email, displayName, password) {
    return (isEmailValid(email) &&
        isDisplayNameValid(displayName) &&
            isPasswordValid(password));
}

// Check if an email is already in use for another account:
// if free, run callback,
// otherwise execute callbackIfTaken
function ifEmailNotTaken(email, callback, callbackIfTaken) {
    db.runQuery(queries.queries.findEmail, [email], function (results) {
        if (results[0].count) {
            // Email has been taken
            callbackIfTaken();
        } else {
            // Email is free
            callback();
        }
    });
}

function isEmailValid(email) {
    // Is the email a valid address?
    var re = config.regex.emailValidation;
    return re.test(email);
}

// Validate the user's chosen display name against a regex
function isDisplayNameValid(displayName) {
    var re = config.regex.displayNameValidation;
    return re.test(displayName);
}

// Validate a password is complex enough to be used
function isPasswordValid(password) {
    var re = config.regex.passwordValidation;
    return re.test(password);
}
var db = require('../database');
var auth = require('../authentication');
var queries = require('../queries');
var config = require('../config');

function createUser(data, callback) {
    var salt = auth.generateSalt();
    var params = [
        data.email, 
        auth.hashPassword(data.password, salt), 
        salt, 
        data.name
    ];
    db.query(queries.queries.register, params, callback);
}

function validateRegisterInput(data) {
    return (isEmailValid(data.email) &&
        isDisplayNameValid(data.name) &&
            isPasswordValid(data.password));
}

// Check if an email is already in use for another account:
// if free, run callback,
// otherwise execute callbackIfTaken
function checkEmailAvailability(email, callback) {
    db.query(queries.queries.findEmail, [email], function (error, results) {
        var emailIsFree = results && results[0] && results[0].count == 0;
        callback(error, emailIsFree);
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

    // @TODO:
    // - get * fields for user based on email
    // - if no result - invalid email - user does not exist
    // - use salt to hash input password
    // - compare hashed input with hashed database passwords
    // - if they match - user can log in

    // check if the user exists based on email
    db.query(queries.queries.getSalt, [email], function (error, saltResults) {
        var salt = saltResults[0].salt;
        var params = [
            email,
            auth.hashPassword(password, salt)
        ];

        db.query(queries.queries.login, params, function (error, results) {
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
        });
    });
}

// Perform user registration. Return {success: true} if it went well
exports.register = function (request, response) {
    var input = {
        email : request.body.email,
        name : request.body.displayName,
        password : request.body.password
    };

    if (!validateRegisterInput(input)) {
        response.send({
            success : false,
            message : 'Invalid input'
        });
        return;
    }

    checkEmailAvailability(input.email, function(error, isFree) {
        if(error || !isFree){
            response.send({
                success : false,
                message : 'Email is already taken'
            });
            return;
        }

        createUser(input, function (err) {
            if(err){
                response.send({
                    success : false,
                    message : 'Database error'
                });
                return;
            }

            response.send({ success: true });
        });
    });
}
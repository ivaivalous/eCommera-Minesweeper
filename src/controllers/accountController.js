/*
    Handle user login, registration and account detail changes.
*/

"use strict";

var db = require('../database');
var auth = require('../authentication');
var queries = require('../queries');
var config = require('../config');
var fb = require('../social/facebook');
var gravatar = require('../social/gravatar');
var messages = require('../messages');

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

function whatWentWrong(data){
    if(!isEmailValid(data.email)){
        return 'email';
    } else if (!isDisplayNameValid(data.name)){
        return 'name';
    } else {
        return 'password';
    }
}

// Check if an email is already in use for another account:
// if free, run callback,
// otherwise execute callbackIfTaken
function checkEmailAvailability(email, callback) {
    db.query(queries.queries.findEmail, [email], function (error, results) {
        var emailIsFree = results && results[0] && results[0].count === 0;
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
    // if user is logged in redirect them to the dashboard
    if(request.session.isUserLogged){
        response.redirect('/dashboard');
        return;
    }

    // Set navigation
    response.viewModel.header.userMenuItems.login.current = true;
    response.viewModel.title = 'Log in to your account';
    response.render('login', response.viewModel);
};

// Request the register page
exports.registerPage = function (request, response) {
    // if user is logged in redirect them to the dashboard
    if(request.session.isUserLogged){
        response.redirect('/dashboard');
        return;
    }

    // Set navigation
    response.viewModel.header.userMenuItems.register.current = true;

    // TODO: Have the title read off a config file
    response.viewModel.title = 'Create a new account';
    response.render('register', response.viewModel);
};

// Perform the actual login - on success return a JWT and the dashboard page
exports.login = function (request, response) {
    // Login a user
    var email = request.body.email;
    var password = request.body.password;

    if (!isEmailValid(email)) {
        response.viewModel.loginError = true;
        response.render('login/index', response.viewModel);
        return;
    }

    runLoginQuery(request, response, email, password, false);
};

var runLoginQuery = function(
        request, response, email, password, socialNetworkLogin) {

    db.query(
            queries.queries.getCustomer,
            [email],
            function (error, results) {

        if (error || results.length === 0) {
            // Render error page
            response.viewModel.loginError = true;
            exports.loginPage(request, response);
            return;

        } else {
            var result = results[0];
            var salt = result.salt;
            var pass = result.password;
            var hash = auth.hashPassword(password, salt);

            // A user may only log in under two conditions:
            // 1. She is not a social network user and the password is correct
            // 2. She is a social network user and socialNetworkLogin is true
            // socialNetworkLogin is used so that verification with the SN API
            // is done in advance
            if ((hash === pass && !result.social_network_user) ||
                    (socialNetworkLogin && result.social_network_user)) {

                request.session.isUserLogged = true;
                request.session.userEmail = email;
                request.session.userId = result.id;
                request.session.displayName = result.display_name;

                // TODO redirect to another page
                response.redirect('/dashboard');
            } else {
                // Render error page
                response.viewModel.loginError = true;
                exports.loginPage(request, response);
            }
        }
    });
};

// Login or register a Facebook user
exports.facebookLogin = function (request, response) {
    // Extract variables
    var name = request.body.name;
    var email = request.body.email;
    var userId = request.body.userId;
    var accessToken = request.body.accessToken;

    // Email must be valid
    if (!isEmailValid(email)) {
        response.viewModel.loginError = true;
        response.render('login/index', response.viewModel);
        return;
    }

    // Verify access token against Facebook to prevent impersonation
    var verifyAccessToken = function(request, response, userId) {
        // TODO request and response shouldn't be parameters here
        return function(fbResponse) {
            if (fbResponse.data.user_id === userId) {
                logInVerifiedFacebookUser(
                    request, response, name, email, userId);
            } else {
                response.viewModel.loginError = true;
                exports.loginPage(request, response);
            }
        };
    };

    // The user access token the user provided was not valid
    var actOnTokenVerificationFailed = function(errorResponse, error) {
        console.log(JSON.errorResponse);
        response.viewModel.loginError = true;
        response.render('login/index', response.viewModel);
        return;
    };

    fb.actOnDebugData(
        accessToken,
        verifyAccessToken(request, response, userId),
        actOnTokenVerificationFailed
    );
};

var logInVerifiedFacebookUser = function(
        request, response, name, email, userId) {
    // TODO request and response shouldn't be parameters here

    db.query(
            queries.queries.getSocialNetworkUser,
            [userId],
            function (error, results) {


        if (results.length) {
            // A user with this social ID already exists
            var result = results[0];
            var currentEmail = result.email;
            var currentDisplayName = result.display_name;

            // If the email or display name from Facebook
            // don't match the database, update the database
            if (currentEmail !== email || currentDisplayName !== name) {
                updateUserBasicInfo(currentEmail, email, name);
            }
        } else {
            // No user with this social ID exists
            // Check if a user with this email address exists
            db.query(
                    queries.queries.getCustomer,
                    [email],
                    function (error, results) {

                if (results.length) {
                    // Such a user already exists and should be merged
                    transformUserToSocialNetworkUser(name, userId, email);
                } else {
                    // No user with this email address exists -
                    // create one
                    createSocialNetworkUser(email, name, userId);
                }
            });
        }

        runLoginQuery(request, response, email, "", true);
    });
};

// Update a user's email address and display name
var updateUserBasicInfo = function(oldEmail, newEmail, newDisplayName) {
    db.query(
            queries.queries.updateUserBasicInfo,
            [newEmail, newDisplayName, oldEmail],
            function (error, results) {
                console.log("Updated user");
                // TODO checks
            }
    );
};

// After a successful Facebook login, update the user as externally
// managed. After this operation the user will no longer be able
// to log in using their email and password combination.
var transformUserToSocialNetworkUser = function(
        displayName, socialNetworkId, email) {


    db.query(
            queries.queries.transformToSocialNetworkUser,
            [displayName, socialNetworkId, email],
            function (error, results) {
                console.log("User " + email + " is now a SN user");
                // TODO checks
            }
    );
};

// Create a user account that can only be logged into via
// a social network's API.
// Password and salt will be generated automatically but can't be used to
// gain access.
var createSocialNetworkUser = function(email, displayName, socialNetworkId) {
    var password = auth.generatePassword();
    var salt = auth.generateSalt();

    password = auth.hashPassword(password, salt);

    db.query(
        queries.queries.registerSocialNetworkUser,
        [email, password, salt, displayName, socialNetworkId],
        function (error, results) {
            console.log("SN user " + email + " has been created.");
            // TODO checks
        }
    );
};

// Perform user registration. Return {success: true} if it went well
exports.register = function (request, response) {
    
    var error = {
        email : messages.validation.registrationEmail,
        password : messages.validation.registrationPassword,
        name : messages.validation.registrationName
    };

    var input = {
        email : request.body.email,
        name : request.body.displayName,
        password : request.body.password
    };

    if (!validateRegisterInput(input)) {
        response.status(200);
        response.send({
            success : false,
            message : error[whatWentWrong(input)]
        });
        return;
    }

    checkEmailAvailability(input.email, function(error, isFree) {
        if (error || !isFree) {
            response.status(200);
            response.send({
                success : false,
                message : 'Email is already taken'
            });
            return;
        }

        createUser(input, function (err) {
            if(err) {
                response.status(400);
                response.send({
                    success : false,
                    message : 'Other error'
                });
                return;
            }            
            response.status(200);
            response.send({success: true, message : 'Superb, now you can go to the login page and play some games!'});

        });
    });
};

// User profile preview page
exports.profile = function (request, response) {
    // if user is not logged in redirect them to homepage
    if(!request.session.isUserLogged){
        response.redirect('/');
        return;
    }

    var userid = request.params.id;
    var sql = queries.queries.getPlayerStats;
    
    db.connect(function (err, connection) {
       
       if(err){
            // render error page
            response.viewModel.error = err;
            response.render('error/500', response.viewModel);
            return;
        }
        
        connection.query(sql, [userid] , function(err, result) {
            
            if(err || result.length === 0){
                // render error page
                response.viewModel.error = "This user doesn't exist!";
                response.render('error/500', response.viewModel);
                return;
            }
            // @TODO:
            // Gather more information 

            // The information that will be displayed on profile page
            var player = result[0];

            response.viewModel.userProfile = {
                name : player.displayName,
                avatarUri: gravatar.getGravatarUri(player.email),
                gamesPlayed: player.gamesPlayed,
                averageScore: player.averageScore,
                bestScore: player.bestScore,
                worstScore: player.worstScore
            };

            response.viewModel.title = "Profile Page of " + result[0].displayName;
            
            response.render('login/profile', response.viewModel);
      });

    });
};

exports.show = function (request, response) {
    response.viewModel.header.userMenuItems.account.current = true;
    response.viewModel.title = "Change your password ";
    response.render('login/account', response.viewModel);    
};

exports.change = function (request, response) {
    var salt, currentPassword;
    var updatePassword = "UPDATE users SET password = ?, salt = ? WHERE email = ?";
    var getSaltAndPassword = "SELECT salt, password FROM users WHERE email = ?";
    var input = {
        email : request.session.userEmail,
        oldpassword : request.body.oldpassword,
        password : request.body.password,
        confirmpassword : request.body.confirmpassword
    };

    if(isPasswordValid(input.password)){
         if(input.password == input.confirmpassword){
            db.connect(function (err, connection) {
                if(err){
                // render error page
                response.viewModel.error = err;
                response.render('error/500', response.viewModel);
                return;
                }
                connection.query(getSaltAndPassword, [input.email] , function(err, result) {
                    if(err){
                        response.viewModel.error = err;
                        response.render('error/500', response.viewModel);
                        return;
                    }
                    if(result.length === 0){
                        response.viewModel.title = 'No user found try again';
                        response.redirect('/account');
                        return;
                    }
                    salt = result[0].salt;
                    currentPassword = result[0].password;
                    if(auth.hashPassword(input.oldpassword, salt) == currentPassword){
                        var newSalt = auth.generateSalt();
                        var newPassword = auth.hashPassword(input.password, newSalt);
                        connection.query(updatePassword, [newPassword, newSalt, input.email] , function(err){
                            if(err){
                                response.viewModel.error = err;
                                response.render('error/500', response.viewModel);
                            }
                            response.viewModel.title = "Change your password ";
                            response.viewModel.wrongpasswordtitle = 'Password changed';
                            response.render('login/account', response.viewModel);
                            return;
                        });
                    }
                });
            });
        
        }
    } else {
        response.viewModel.title = "Change your password ";
        response.viewModel.wrongpasswordtitle = 'Your password have to contain a-Z 0-9 and special symbols';
        response.render('login/account', response.viewModel);
        return;
    }
};
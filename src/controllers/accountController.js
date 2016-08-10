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
    // if user is logged in redirect them to the dashboard
    if(request.session.isUserLogged){
        response.redirect('/dashboard');
        return;
    }

    // Set navigation
    response.viewModel.header.userMenuItems.login.current = true;
    response.viewModel.title = 'Log in to your account';
    response.render('login', response.viewModel);
}

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

    // @TODO: single query login:
    // - get * fields for user based on email
    // - if no result - invalid email - user does not exist
    // - use salt to hash input password
    // - compare hashed input with hashed database passwords
    // - if they match - user can log in

    // check if the user exists based on email
    db.query(queries.queries.getCustomer, [email], function (error, results) {
        if(error || results.length === 0) {
            // render error page
            response.send({
                success: false,
                message: 'Database issue'
            });
            return;
        } else {
            var result = results[0];
            var salt = result.salt;
            var pass = result.password;

             if(auth.hashPassword(password, salt) != pass ){
      	       // render error page
               response.viewModel.loginError = true;
               exports.loginPage(request, response);
             } else {
                request.session.isUserLogged = true;
                request.session.userEmail = email;
                request.session.userId = result.id;
                request.session.displayName = result["display_name"];
                
                // TODO redirect to another page
                response.redirect('/dashboard');
             }
        }
    });
},

// Perform user registration. Return {success: true} if it went well
exports.register = function (request, response) {
    var input = {
        email : request.body.email,
        name : request.body.displayName,
        password : request.body.password
    };

    if (!validateRegisterInput(input)) {
        response.status(400);
        response.send({
            success : false,
            message : 'Invalid input'
        });
        return;
    }

    checkEmailAvailability(input.email, function(error, isFree) {
        if (error || !isFree) {
            response.status(400);
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
            response.send({ success: true });
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
    var sql = 'SELECT * FROM users WHERE id = ?';
    
    db.connect(function (err, connection) {
       
       if(err){
            // render error page
            response.viewModel.error = err;
            response.render('error/500', response.viewModel);
            return;
        }
        
        connection.query(sql, [userid] , function(err, result) {
            
            if(err || result.length == 0){
                // render error page
                response.viewModel.error = "This user doesn't exist!";
                response.render('error/500', response.viewModel);
                return;
            }
            // @TODO:
            // Gather more information 

            // The information that will be displayed on profile page 
            response.viewModel.userProfile = {
                id : result[0].id,
                email : result[0].email,
                name : result[0].display_name
            };

            response.viewModel.title = "Profile Page of " + result[0].display_name;
            
            response.render('login/profile', response.viewModel);
      });

    });
}

exports.show = function (request, response) {
    response.viewModel.header.userMenuItems.account.current = true;
    response.viewModel.title = "Change your password ";
    response.render('login/account', response.viewModel);    
}

exports.change = function (request, response) {
    var salt, currentPassword;
    var updatePassword = "UPDATE users SET password = ?, salt = ? WHERE email = ?";
    var getSaltAndPassword = "SELECT salt, password FROM users WHERE email = ?";
    var input = {
        email : request.session.userEmail,
        oldpassword : request.body.oldpassword,
        password : request.body.password,
        confirmpassword : request.body.confirmpassword
    }
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
                    if(result.length == 0){
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
                            response.redirect('/dashboard');
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
}
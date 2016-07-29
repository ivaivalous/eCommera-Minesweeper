var util = require('util');

function getUserMenuItems (loggedIn) {
	if(loggedIn){
		return {
			account : {
				label: 'My account',
				href: '/account'
			},
			logout : {
				label: 'Log out',
				href: '/logout'
			}
		};
	} else {
		return {
			login : {
				label: 'Log in',
				href: '/login'
			},
			register : {
				label: 'Register',
				href: '/register'
			}
		};
	}
}

module.exports = function(request, response, next){
	response.viewModel = {
		head : {
			title : 'Minesweeper by eCommera'
		},
		header : {
			title : 'eCommera Minesweeper',
			userMenuItems : getUserMenuItems(request.session.isUserLogged),
			menuItems : {
				home : {
					label: 'Home',
					href: '/'
				},
				// @TODO: for logged in users
				dashboard : {
					label: 'Dashboard',
					href: '/dashboard'
				},
				ranking : {
					label: 'Ranking', // High score / Hall of fame / Score board
					href: '/ranking'
				}
			}
		},
		footer : {
			copyright : '© eCommera Limited ' + new Date().getFullYear()
		},
		//This will be used for storing session params
		session : {
			isLoggedUser : request.session.isUserLogged
		},

		// utility method for debugging
		// dumps whatever it receives as arguments to the bottom of the page
		// uses the debuglog partial view in the main layout
		debug : function () {
			// when used for the first time create an array as the log property 
			// of the debug method and start filling it the method's arguments
			response.viewModel.debug.log = response.viewModel.debug.log || [];
			var rows = Array.prototype.slice.call(arguments);
			for(var i = 0; i < rows.length; i++){
				response.viewModel.debug.log.push(util.inspect(rows[i]));
			}
		}
	};
	next();
};
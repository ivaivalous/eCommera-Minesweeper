var util = require('util');

module.exports = function(request, response, next){
	response.viewModel = {
		head : {
			title : 'Minesweeper by eCommera'
		},
		header : {
			title : 'eCommera Minesweeper',
			userMenuItems : {
				/*
				// @TODO: for logged in users
				account : {
					label: 'My account', // @TODO: print user's name from session?
					href: '/account',
					showToGuests: false,
					showToRegistered: true
				},
				logout : {
					label: 'Log out',
					href: '/account/logout',
					showToGuests: false,
					showToRegistered: true
				},*/
				login : {
					label: 'Log in',
					href: '/login',
					showToGuests: true,
					showToRegistered: false
				},
				register : {
					label: 'Register',
					href: '/register',
					showToGuests: true,
					showToRegistered: false
				}
			},
			menuItems : {
				home : {
					label: 'Home',
					href: '/',
					showToGuests: true,
					showToRegistered: true
				},
				// @TODO: for logged in users
				dashboard : {
					label: 'Dashboard',
					href: '/dashboard',
					showToGuests: true,
					showToRegistered: true
				},
				ranking : {
					label: 'Ranking', // High score / Hall of fame / Score board
					href: '/ranking',
					showToGuests: false,
					showToRegistered: true
				}
			}
		},
		footer : {
			copyright : '© eCommera Limited ' + new Date().getFullYear()
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
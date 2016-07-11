module.exports = function(request, response, next){
	response.viewModel = {
		head : {
			title : 'Minesweeper by eCommera'
		},
		header : {
			title : 'eCommera Minesweeper',
			menuItems : {

				// @TODO: for logged in users
				home : {
					label: 'Home',
					href: '/dashboard'
				},
				ranking : {
					label: 'Ranking', // High score / Hall of fame / Score board
					href: '/ranking'
				},
				account : {
					label: 'My account', // @TODO: print user's name from session?
					href: '/account'
				},
				logout : {
					label: 'Log out',
					href: '/account/logout'
				}

				/*
				// @TODO: for guest users
				home : {
					label: 'Home',
					href: '/'
				},
				login : {
					label: 'Log in',
					href: '/account/login'
				},
				register : {
					label: 'Register',
					href: '/account/register'
				}*/
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
			Array.prototype.push.apply(response.viewModel.debug.log, arguments);
		}
	};
	next();
};
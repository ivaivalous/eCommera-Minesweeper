// this is the application's configuration that should hold all environment 
// variables. It is left empty on purpose since these configuration are not to 
// be shared or versioned. Each deployment of the app will use it's unique set 
// of environment variables
module.exports = {
	
	// Port
	// On which port will the app listen. Defaults to 3000
	// port : 80,
	
	// Environment
	// May be 'production' or 'development' and may change how the app behaves
	// environment : 'development',

	database : {
		host : 'localhost',
		user : 'root',
		password : '',
		database : 'minesweeper'
	}
	
};

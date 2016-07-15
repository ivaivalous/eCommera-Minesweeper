// this is the application's configuration that should hold all environment 
// variables. It is left empty on purpose since these configuration are not to 
// be shared or versioned. Each deployment of the app will use its unique set 
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
	},
	jwt: {
		secret: '',
		ttlHours: 24,
		algorithm: 'HS256'
	},
	passwordHashing: {
		numberOfIterations: 1000,
		keyLengthBytes: 64
	},
	regex: {
        emailValidation: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        displayNameValidation: /^.{2,64}$/,
        passwordValidation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*([^\w])).{8,100}$/
    }
	
};

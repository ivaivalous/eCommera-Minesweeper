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
	environment : process.env.NODE_ENV || 'development' ,

	database : {
		host : 'localhost',
		user : 'root',
		password : '',
		database : 'minesweeper'  
	},
    session: {
        secret: "REPLACE ME",
        cookieMaxAge: 300000
    },
	passwordHashing: {
		numberOfIterations: 1000,
		keyLengthBytes: 64
	},
	regex: {
        emailValidation: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        displayNameValidation: /^.{2,64}$/,
        passwordValidation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*([^\w])).{8,100}$/,
        roomNameValidation: /^.{3,32}$/
    },
    gameBoundaries: {
    	x: {
    		minX: 5,
    		maxX: 100
    	},
    	y: {
    		minY: 5,
    		maxY: 100
    	},
    	minePercentMax: 0.9,
    	maxPlayerCount: 100,
    	allowedGameIdCharacters: "BCDFJKLMNPQRSTVWXYXbcdfghjklmnpqrstvwxyz123456789",
        defaultGameStartTimeMs: 300000,
        defaultThinkTimeMs: 30000,
        maxGames: 200,
        maxGamesPerHost: 2,
        maxGamesToJoin: 2,
        roomIdLength: 7
    }
};

# Minesweeper

This is the code for the multiplayer minesweeper app. It consists of:
- Express.js MVC back-end app with a Handlebars template engine
- MySQL as persistent storage
- Client-side app - TBC

## Setting up

1. Install Node.js (for Windows download the installer from their site)
2. Download and install MySQL (https://github.com/ivaivalous/eCommera-Minesweeper/wiki/Installing-MySQL)
3. Import the database schema (https://github.com/ivaivalous/eCommera-Minesweeper/blob/master/schema/db/minesweeper.sql)
2. CD to this folder and run `npm install`
3. Edit the `config.js` file to change any environment variables you may need
  1. Set `database.password` to your DB's password
  2. Set `session.secret` to a secret value of your choice
  3. Set `social.facebook.applicationSecret` to the Facebook app's ID and secret key (ask Ivo M. for it)
4. Edit your `hosts` file to add `127.0.0.1     school.ecommera.net` as a separate line at the bottom of the file (this is because Facebook only works with whitelisted domains)
5. Run the app with `npm start`
6. Navigate to `http://school.ecommera.net:3000` in your browser to load the Minesweeper application

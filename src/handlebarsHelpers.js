var handlebars = require('hbs');

handlebars.registerHelper('json', function(value) {
    return JSON.stringify(value);
});
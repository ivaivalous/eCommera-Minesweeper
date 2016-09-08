var handlebars = require('hbs');

handlebars.registerHelper('json', function(value) {
    return JSON.stringify(value);
});

handlebars.registerHelper('increment', function(value) {
    if (!isNaN(value)) {
        return value + 1;
    }
    return 0;
});
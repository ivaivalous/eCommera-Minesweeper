/*
    Handlebars helpers to aid UI display.
    http://handlebarsjs.com/block_helpers.html
*/

"use strict";

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

handlebars.registerHelper('gravatar', function(uri, width) {
    return new handlebars.SafeString(
        '<img src="https://www.gravatar.com/avatar/' +
        uri + '" width="' + width + 'px" />'
    );
});
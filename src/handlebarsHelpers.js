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
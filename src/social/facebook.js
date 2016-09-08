/*
    Do backend to Facebook communication.
    Primary usage: verify user access tokens against the Facebook API
    to prevent impersonation.
*/

"use strict";

var config = require('../config');
'use strict';

var passport = require('passport');

/**
 * Login Required middleware.
 */

// Gives a forbidden error if the user isn't authenticated
exports.casBlock = function(options) {
    return function(req, res, next) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(403).json({
                error: 'Not Authorized'
            });
        }
        next();
    }
}

// Automatically redirects to the login page if the user isn't authenticated
exports.casBounce = function(options) {
    if (typeof options == 'string') {
        options = {
            redirectTo: options
        }
    }
    options = options || {};

    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

    return function(req, res, next) {
        console.log(req.user);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            if (setReturnTo && req.session) {
                req.session.returnTo = req.originalUrl || req.url;
            }
            return res.redirect(url);
        }
        next();
    }
}
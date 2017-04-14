'use strict';

var passport = require('passport');

module.exports = function(app, models, prefix) {

    // login page.
    // TODO: figure out if this should have a prefix.
    app.get('/login', function(req, res, next) {
        passport.authenticate('cas', {
            successReturnToOrRedirect: '/'
        })(req, res, next);
    });

    // TODO: get this working, because it isn't?
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    })

    return app;
}
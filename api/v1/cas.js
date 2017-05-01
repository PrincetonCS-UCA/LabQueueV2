'use strict';

var passport = require('passport');

module.exports = function(app, models, prefix) {

    var auth = require('./middleware/auth')(app, models);

    var Controller = require('./controllers/authController')(app, models);

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

    app.route(prefix + 'wsse/:service')
        .get(auth.casBounce(), Controller.getWSSEKey);

    return app;
}
var passport = require('passport');
var models = require('../models');

module.exports = function(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new(require('passport-cas').Strategy)({
        ssoBaseURL: 'https://fed.princeton.edu/cas',
        serverBaseURL: 'http://localhost:3000'
    }, function(login, done) {
        models.User.findOne({
                where: {
                    casId: login
                }
            })
            .error(function(error) {
                done(error);
            })
            .then(function(user) {
                if (user) {
                    done(null, user);
                }
                else {

                    models.User.create({
                        name: "Test User",
                        casId: login,
                        universityId: "dmliao"
                    }).then(function(user) {
                        done(null, user);
                    });
                }
            });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
}
var passport = require('passport');
var models = require('../models');

const tigerbookAccessor = require('../api/v1/accessors/tigerbookAccessor')(models);

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

                    tigerbookAccessor.getStudentInfo(login).then(function(studentInfo) {
                        console.log(studentInfo);
                        models.User.create({
                            name: tigerbookAccessor.getName(studentInfo),
                            casId: login,
                            universityId: login
                        }).then(function(user) {
                            done(null, user);
                        });
                    }).catch(function(err) {
                        // can't access tigerbook
                        models.User.create({
                            name: login,
                            casId: login,
                            universityId: login
                        }).then(function(user) {
                            done(null, user);
                        });
                    })

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
'use strict';

var auth = require('./middleware/auth');

module.exports = function(app, models, prefix) {

    var Controller = require('./controllers/userController')(app, models);

    app.route(prefix + 'me')
        .get(auth.casBlock(), Controller.getCurrentUser);

    // programmatically create users (might be useful for importing or setting TAs)
    app.route(prefix + 'users')
        .post(auth.isAuthenticated(), Controller.createUser);

}
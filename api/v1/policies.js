'use strict';

var policyTypes = require('../../enums/policyTypes');

module.exports = function(app, models, prefix) {

    var auth = require('./middleware/auth')(app, models);

    var Controller = require('./controllers/policyController')(app, models);

    app.route(prefix + 'policies/:policy')
        .get(auth.isAuthenticated(), Controller.getPolicyById);

    app.route(prefix + 'queue/:queue/policies')
        .get(auth.isAuthenticated(), Controller.getPolicies)
        .post(auth.isAuthenticated(), Controller.createPolicy);

    app.route(prefix + 'queue/:queue/policies/:profile')
        .get(auth.isAuthenticated(), Controller.getPoliciesForUser);
}
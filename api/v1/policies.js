'use strict';

var policyTypes = require('../../enums/policyTypes');

module.exports = function(app, models, prefix) {

    var auth = require('./middleware/auth')(app, models);

    var Controller = require('./controllers/policyController')(app, models);

    // policies
    app.route(prefix + 'queue/:queue/policies')
        .get(auth.isAuthenticated(), Controller.getPolicies)
        .post(auth.isAuthenticated(), Controller.createPolicy);

    app.route(prefix + 'queue/:queue/policies/:policy')
        .get(auth.isAuthenticated(), Controller.getOnePolicy);
    // permissions are uniquely ID'd by a combination of the queue and the role
}
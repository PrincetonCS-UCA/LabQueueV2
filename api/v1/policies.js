'use strict';

var auth = require('./middleware/auth');
var policyTypes = require('../../enums/policyTypes');

module.exports = function(app, models, prefix) {

    var Controller = require('./controllers/policyController')(app, models);

    // policies
    app.route(prefix + 'queue/:queue/permissions')
        .get(auth.casBlock(), Controller.getPolicies);

    app.route(prefix + 'queue/:queue/permissions/:role')
        .get(auth.casBlock(), Controller.getOnePolicy);
    // permissions are uniquely ID'd by a combination of the queue and the role

}
'use strict';

var auth = require('./middleware/auth');
var policyTypes = require('../../enums/policyTypes');

module.exports = function(app, models, prefix) {

    var Controller = require('./controllers/queueController')(app, models);

    /// ROUTES
    ///////////////////

    app.get(prefix + 'queue/create', auth.casBlock(), Controller.postQueue);

    app.route(prefix + 'queue/:queue')
        .get(auth.casBlock(), Controller.getQueueMeta);

    app.route(prefix + 'queue/:queue/requests')
        .get(auth.casBlock(), Controller.getQueue)
        .post(auth.casBlock(), Controller.createRequest);

    // app.route(prefix + 'queue/:queue/requests/:request');
    // get retrieves a single one
    // put lets you update it
    // delete lets you delete it

    // put only - marks a request as complete.
    // app.route(prefix + 'queue/:queue/requests/:request/complete');

    // test routes
    app.route(prefix + 'queue/:queue/create')
        .get(auth.casBlock(), Controller.createRequest);

    app.route(prefix + 'queue/:queue/requests/:username')
        .get(auth.casBlock(), Controller.getSingleRequest);
    app.route(prefix + 'queue/:queue/requests/:username/cancel')
        .get(auth.casBlock(), Controller.cancelRequest);
}
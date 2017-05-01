'use strict';

var policyTypes = require('../../enums/policyTypes');

module.exports = function(app, models, prefix) {

    var auth = require('./middleware/auth')(app, models);

    var Controller = require('./controllers/queueController')(app, models);

    /// ROUTES
    ///////////////////
    app.route(prefix + 'queue')
        .post(auth.isAuthenticated(), Controller.createQueue);

    app.route(prefix + 'queue/:queue')
        .get(auth.isAuthenticated(), Controller.getQueueMeta)
        .put(auth.isAuthenticated(), Controller.editQueueMeta);

    app.route(prefix + 'queue/:queue/active')
        .get(auth.isAuthenticated(), Controller.getQueueActive)
        .post(auth.isAuthenticated(), Controller.createRequest);

    app.route(prefix + 'queue/:queue/active/:username')
        .get(auth.isAuthenticated(), Controller.getActiveRequestByUser);

    app.route(prefix + 'queue/:queue/requests/:request')
        .get(auth.isAuthenticated(), Controller.getSingleRequest)
        .put(auth.isAuthenticated(), Controller.editSingleRequest);

    app.route(prefix + 'queue/:queue/requests')
        .post(auth.isAuthenticated(), Controller.createRequest);

    // test routes
    app.get(prefix + 'queue/create', auth.isAuthenticated(), Controller.createQueue);

    app.route(prefix + 'queue/:queue/create')
        .get(auth.isAuthenticated(), Controller.createRequest);

    app.route(prefix + 'queue/:queue/requests/:request/cancel')
        .get(auth.isAuthenticated(), Controller.cancelRequest);
    app.route(prefix + 'queue/:queue/requests/:request/claim')
        .get(auth.isAuthenticated(), Controller.claimRequest);
    app.route(prefix + 'queue/:queue/requests/:request/complete')
        .get(auth.isAuthenticated(), Controller.completeRequest);
}
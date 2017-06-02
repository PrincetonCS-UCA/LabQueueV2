'use strict';

var policyTypes = require('../../enums/policyTypes');

module.exports = function(app, models, prefix) {

    var auth = require('./middleware/auth')(app, models);
    var permissions = require('./middleware/permissions')(app, models);

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
        .put(auth.isAuthenticated(), permissions.canEditRequest(), Controller.editSingleRequest);

    app.route(prefix + 'queue/:queue/requests')
        .post(auth.isAuthenticated(), Controller.createRequest);

    // test routes
    app.get(prefix + 'queue/create', auth.casBounce(), Controller.createQueueTest);

    app.route(prefix + 'queue/:queue/create')
        .get(auth.isAuthenticated(), Controller.createRequest);

    app.route(prefix + 'queue/:queue/requests/:request/cancel')
        .post(auth.isAuthenticated(), permissions.canCancelRequest(), Controller.cancelRequest);
    app.route(prefix + 'queue/:queue/requests/:request/complete')
        .post(auth.isAuthenticated(), permissions.canHelpRequest(), Controller.completeRequest);
}
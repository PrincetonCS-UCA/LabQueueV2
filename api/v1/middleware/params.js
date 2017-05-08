'use strict';

const errors = require('feathers-errors');

module.exports = function(app, models) {
    /// PARAMS
    ///////////

    const queueAccessor = require('../accessors/queueAccessor')(models);

    var queueParam = function(req, res, next, id) {
        if (!id.match(/^[a-z0-9](-?[a-z0-9]+)*$/i)) {
            console.log("Does not match");
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            return next('route');
        }
        queueAccessor.findQueue(id).then(function(queue) {
            if (!queue) {
                return next('route');
            }
            req.queue = queue;
            return next();
        }).catch(function(err) {
            return next(err);
        });
    };

    // this makes it so if a route has :queue as a variable,
    // req.queue will automatically be populated with the desired queue
    // or have it 404 if the queue doesn't exist.
    app.param('queue', queueParam);

    var profileParam = function(req, res, next, id) {
        if (!id.match(/^[a-z0-9](-?[a-z0-9]+)*$/i)) {
            console.log("Does not match");
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            return next('route');
        }
        models.User.findOne({
            where: {
                casId: id
            }
        }).then(function(user) {
            if (!user) {
                return next('route');
            }
            req.profile = user;
            return next();
        }).catch(function(err) {
            return next(err);
        });
    };

    app.param('profile', profileParam);

    var requestParam = function(req, res, next, id) {
        var queueId;
        if (req.queue) {
            queueId = req.queue.id;
        }
        else {
            throw errors.NotFound();
        }

        console.log("We reached here");

        queueAccessor.findRequest(queueId, id).then(function(request) {
            if (!request) {
                return next('route');
            }
            req.request = request;
            return next();
        }).catch(function(err) {
            console.log(err);
            return next(err);
        });
    }

    app.param('request', requestParam);

    // we should also have a request param
}
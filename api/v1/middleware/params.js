'use strict';

module.exports = function(app, models) {
    /// PARAMS
    ///////////

    var queueParam = function(req, res, next, id) {
        if (!id.match(/^[a-z0-9](-?[a-z0-9]+)*$/i)) {
            console.log("Does not match");
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            return next('route');
        }
        models.Queue.findOne({
            where: {
                id: id
            }
        }).then(function(queue) {
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
        models.Users.findOne({
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
}

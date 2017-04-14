'use strict';

const policyTypes = require('../../../enums/policyTypes');
const requestStatuses = require('../../../enums/requestStatuses');
const associations = require('../../../enums/associations');

module.exports = function(app, models) {

    const queueRepo = require('../repositories/queueRepo')(models);
    const policyRepo = require('../repositories/policyRepo')(models);
    const userRepo = require('../repositories/userRepo')(models);

    /// AUTHORIZATION
    ///////////////////

    function postQueue(req, res) {

        var q = {
            name: "Test Queue",
            description: "Description for test queue"
        };

        queueRepo.createQueue(q, req.user.id).bind({}).then(function(queue) {
            console.log(queue);
            this.queue = queue;
            return policyRepo.changePolicyMembers(queue.id,
                policyTypes.ta, [req.user.id], associations.add);
        }).then(function(result) {
            console.log(result);
            res.json(this.queue);
        }).catch(function(e) {
            console.log(e);
            res.json({
                error: e
            });
        })
    }

    function getQueue(req, res) {

        queueRepo.findCurrentRequestsInQueue(req.queue.id).then(function(
            requests) {
            res.json(requests);
        }).catch(function(e) {
            console.log(e);
            // Send better user error logs.
            res.json({
                error: e
            });
        });
    }

    function getQueueMeta(req, res) {
        res.json(req.queue);
    }

    function createRequest(req, res) {

        var r = {
            message: "This is a request"
        };
        // post a request
        queueRepo.createRequest(r, req.queue.id, req.user.id).then(function(
                request) {
                res.json(request);
            })
            .catch(queueRepo.RequestAlreadyExistsError, function(e) {
                res.status(403).json({
                    error: 'User cannot post more than one request at a time'
                });
            })
            .catch(function(e) {
                console.log(e);
                // Send better user error logs.
                res.json({
                    error: e
                });
            });

    }

    function getSingleRequest(req, res) {

        userRepo.findUserByCasId(req.params.username).then(function(author) {

            return queueRepo.findActiveRequestByAuthor(req.queue.id, author.id)

        }).then(function(request) {
            res.json(request);
        }).catch(function(e) {
            console.log(e);
            // Send better user error logs.
            res.json({
                error: e.toJSON()
            });
        });

    }

    function cancelRequest(req, res) {
        userRepo.findUserByCasId(req.params.username).then(function(author) {

            return queueRepo.changeRequestStatus(req.queue.id,
                author.id, requestStatuses.canceled, req.user.id);

        }).then(function(request) {

            res.json(request);

        }).catch(function(e) {
            console.log(e);
            // Send better user error logs.
            res.json({
                error: e
            });
        })
    }

    return {
        postQueue: postQueue,
        getQueue: getQueue,
        getQueueMeta: getQueueMeta,
        createRequest: createRequest,
        getSingleRequest: getSingleRequest,
        cancelRequest: cancelRequest
    };
}
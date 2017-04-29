'use strict';

const policyTypes = require('../../../enums/policyTypes');
const requestStatuses = require('../../../enums/requestStatuses');
const associations = require('../../../enums/associations');

module.exports = function(app, models) {

    const queueAccessor = require('../accessors/queueAccessor')(models);
    const policyAccessor = require('../accessors/policyAccessor')(models);
    const userAccessor = require('../accessors/userAccessor')(models);

    /// AUTHORIZATION
    ///////////////////

    function createQueue(req, res) {

        var q = {
            name: "Test Queue",
            description: "Description for test queue"
        };

        queueAccessor.createQueue(q, req.user.id).bind({}).then(function(queue) {
            console.log(queue);
            this.queue = queue;
            return policyAccessor.changePolicyMembers(queue.id,
                policyTypes.ta, [req.user.id], associations.add);
        }).then(function(result) {
            console.log(result);
            res.json(this.queue);
        }).catch(function(e) {
            console.log(e);
            res.status(400).json({
                error: e
            });
        })
    }

    function getQueueActive(req, res) {

        queueAccessor.findCurrentRequestsInQueue(req.queue.id).then(function(
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

    function editQueueMeta(req, res) {
        res.send("Unimplemented");
    }

    function createRequest(req, res) {

        var r = {
            message: "This is a request"
        };
        // post a request
        queueAccessor.createRequest(r, req.queue.id, req.user.id).then(function(
                request) {
                res.json(request);
            })
            .catch(queueAccessor.RequestAlreadyExistsError, function(e) {
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
        // TODO
        res.status(404, "Unimplemented");
    }

    function editSingleRequest(req, res) {
        res.status(404, "Unimplemented");
    }

    function getActiveRequestByUser(req, res) {

        userAccessor.findUserByCasId(req.params.username).then(function(author) {

            return queueAccessor.findActiveRequestByAuthor(req.queue.id, author.id)

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
        /*
        userAccessor.findUserByCasId(req.params.username).then(function(author) {

            return queueAccessor.changeRequestStatus(req.queue.id,
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
        */
    }

    function claimRequest(req, res) {
        res.status(404, "Unimplemented");
    }

    function completeRequest(req, res) {
        res.status(404, "Unimplemented");
    }

    return {
        createQueue: createQueue,
        getQueueActive: getQueueActive,
        getQueueMeta: getQueueMeta,
        editQueueMeta: editQueueMeta,

        createRequest: createRequest,
        getSingleRequest: getSingleRequest,
        editSingleRequest: editSingleRequest,

        getActiveRequestByUser: getActiveRequestByUser,
        cancelRequest: cancelRequest,
        claimRequest: claimRequest,
        completeRequest: completeRequest
    };
}
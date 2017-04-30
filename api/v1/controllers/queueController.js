'use strict';

const policyTypes = require('../../../enums/policyTypes');
const requestStatuses = require('../../../enums/requestStatuses');
const associations = require('../../../enums/associations');

const Promise = require('bluebird');

const Validator = require('jsonschema').Validator;
var v = new Validator();

module.exports = function(app, models) {

    const queueAccessor = require('../accessors/queueAccessor')(models);
    const policyAccessor = require('../accessors/policyAccessor')(models);
    const userAccessor = require('../accessors/userAccessor')(models);
    const courseAccessor = require('../accessors/courseAccessor')(models);

    // VALIDATION
    ///////////////////

    var queueObjSchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            description: {
                type: 'string'
            },
            courses: {
                type: 'array',
                'items': {
                    'type': 'string'
                }
            },
            rooms: {
                type: 'array',
                'items': {
                    'type': 'string'
                }
            }
        },
        required: ['name']
    };

    /// AUTHORIZATION
    ///////////////////

    function createQueue(req, res) {

        if (!req.body.name) {
            /* return res.status(400).json({
                 error: "A queue cannot have no name."
             })*/
            req.body.name = "Test Queue";
        }

        if (!req.body.description) {
            req.body.description = "";
        }

        var courses = [];
        if (req.body.courses && req.body.courses.length) {
            courses = req.body.courses;
        }

        var rooms = [];
        if (req.body.rooms && req.body.rooms.length) {
            rooms = req.body.rooms;
        }

        var q = {
            name: req.body.name,
            description: req.body.description
        };

        console.log(courses);

        var coursePromises = [];
        for (var i = 0; i < courses.length; i++) {
            coursePromises.push(courseAccessor.createOrFindCourse(courses[i]));
        }

        Promise.all(coursePromises).then(function(courseIds) {
            queueAccessor.createQueue(q, req.user.id).bind({}).then(function(
                queue) {
                this.queue = queue;
                return policyAccessor.changePolicyMembers(queue.id,
                    policyTypes.ta, [req.user.id], associations.add
                );
            }).then(function(result) {
                return this.queue.setCourses(courseIds);

            }).then(function() {
                res.json(this.queue);
            }).catch(function(e) {
                res.status(400).json({
                    error: e
                });
            })
        }).catch(function(e) {
            res.status(400).json({
                error: e
            });
        })

    }

    function getQueueActive(req, res) {

        queueAccessor.findCurrentRequestsInQueue(req.queue.id).then(
            function(
                requests) {
                res.json(requests);
            }).catch(function(e) {
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
        queueAccessor.createRequest(r, req.queue.id, req.user.id).then(
                function(
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

        userAccessor.findUserByCasId(req.params.username).then(function(
            author) {

            return queueAccessor.findActiveRequestByAuthor(req.queue
                .id, author.id)

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

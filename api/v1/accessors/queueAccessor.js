'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');
const associations = require('../../../enums/associations');

const getArraysOfIds = require('../../../utils/getArraysOfIds');

const Promise = require('bluebird');

const Validator = require('jsonschema').Validator;
var v = new Validator();

module.exports = function(models) {

    const courseAccessor = require('./courseAccessor')(models);
    const roomAccessor = require('./roomAccessor')(models);
    const policyAccessor = require('./policyAccessor')(models);

    // VALIDATION
    //////////////

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

    var requestObjSchema = {
        type: 'object',
        properties: {
            message: {
                type: 'string'
            }
        }
    }

    // ERRORS
    //////////
    var InvalidQueueError = function() {
        Error.apply(this, arguments);
    };

    var RequestNotFoundError = function() {
        Error.apply(this, arguments);
    };

    var RequestAlreadyExistsError = function() {
        Error.apply(this, arguments);
    };

    // METHODS
    ////////////

    function createQueue(queueObj, ownerId) {

        if (!v.validate(queueObj, queueObjSchema).valid) {
            throw new InvalidQueueError();
        }

        queueObj.courses = queueObj.courses || [];
        queueObj.rooms = queueObj.rooms || [];

        var q = {
            name: queueObj.name,
            description: queueObj.description || ''
        };

        return Promise.map(queueObj.courses, function(course) {
            return courseAccessor.createOrFindCourse(course);
        }).bind({}).then(function(courseObjs) {
            this.courses = courseObjs;
            return Promise.map(queueObj.rooms, function(room) {
                return roomAccessor.createOrFindRoom(room);
            });
        }).then(function(roomObjs) {
            this.rooms = roomObjs;
        }).then(function() {
            return models.Queue.create(q);
        }).then(function(dbQueue) {
            this.queue = dbQueue;
            return dbQueue.setOwner(ownerId);
        }).then(function() {
            return policyAccessor.changePolicyMembers(this.queue.id,
                policyTypes.ta, [ownerId], associations.add
            );
        }).then(function(result) {
            return this.queue.setCourses(this.courses);
        }).then(function(result) {
            return this.queue.setRooms(this.rooms);
        }).then(function() {
            return findQueue(this.queue.id);
        }).catch(function(e) {
            throw e;
        });

    }

    function findQueue(queueId) {
        return models.Queue.findOne({
            where: {
                id: queueId
            },
            include: [{
                model: models.Course,
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }, {
                model: models.Room,
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }, ]
        });
    }

    function createRequest(requestObj, queueId, authorId, courseId, roomId) {

        return findActiveRequestByAuthor(queueId, authorId).bind({}).then(function(request) {
            if (!request) {
                return models.Request.create(requestObj);
            }
            else {
                throw new RequestAlreadyExistsError();
            }
        }).then(function(request) {
            this.request = request;
            return request.setQueue(queueId);
        }).then(function() {
            return this.request.setAuthor(authorId);
        }).then(function() {
            return this.request.setCourse(courseId);
        }).then(function() {
            return this.request.setRoom(roomId);
        }).then(function() {
            return this.request.save();
        });
    }

    function findRequest(queueId, requestId) {
        return models.Request.findOne({
            where: {
                queueId: queueId,
                id: requestId
            }
        });
    }

    // checks if there is already a request by this user in the queue
    // returns a Promise
    function findActiveRequestByAuthor(queueId, userId) {
        return models.Request.findOne({
            where: {
                queueId: queueId,
                authorId: userId,
                status: requestStatuses.in_queue
            }
        });
    }

    function findCurrentRequestsInQueue(queueId) {
        return models.Request.findAll({
            where: {
                queueId: queueId,
                status: requestStatuses.in_queue
            }
        });
    }

    function findRequestHistory(queueId) {
        return models.Request.findAll({
            where: {
                queueId: queueId
            }
        });
    }

    function changeRequestStatus(queueId, requestId, status, editorUserId) {
        return findRequest(queueId, requestId).then(function(request) {
            if (!request) {
                throw new RequestNotFoundError();
            }

            return request.setHelper(editorUserId).then(function() {

                return request.update({
                    status: status
                });
            })
        })
    }

    return {
        RequestNotFoundError: RequestNotFoundError,
        RequestAlreadyExistsError: RequestAlreadyExistsError,
        InvalidQueueError: InvalidQueueError,

        findCurrentRequestsInQueue: findCurrentRequestsInQueue,
        findActiveRequestByAuthor: findActiveRequestByAuthor,

        createQueue: createQueue,
        findQueue: findQueue,

        createRequest: createRequest,
        changeRequestStatus: changeRequestStatus
    };

}
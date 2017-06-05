'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');
const associations = require('../../../enums/associations');

const getArraysOfIds = require('../../../utils/getArraysOfIds');

const patchUtils = require('./utils/patchOps');

var convertToSlug = require('../../../utils/convertSlug');

const Promise = require('bluebird');
const _ = require('lodash');

const makeError = require('make-error');

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
    var InvalidQueueError = makeError('InvalidQueueError');
    var RequestNotFoundError = makeError('RequestNotFoundError');
    var RequestAlreadyExistsError = makeError('RequestAlreadyExistsError');

    // METHODS
    ////////////

    /* 
     Utility function to retrieve a sequelize object, returning a promise with the 
     sequelize object. If the input is a queue Id, the function will fetch the 
     sequelize object from the database
     */
    function getDbQueue(dbQueueOrQueueId) {
        if (_.isString(dbQueueOrQueueId)) {
            return findQueue(dbQueueOrQueueId);
        }
        else {
            // it's a sequelize instance already
            return Promise.resolve(dbQueueOrQueueId);
        }
    }

    function createQueue(queueObj, ownerId) {

        if (!v.validate(queueObj, queueObjSchema).valid) {
            throw new InvalidQueueError();
        }

        queueObj.courses = queueObj.courses || [];
        queueObj.rooms = queueObj.rooms || [];

        var q = {
            name: queueObj.name,
            description: queueObj.description || '',
            id: convertToSlug(queueObj.name)
        };

        return models.Queue.create(q).then(function(dbQueue) {
            this.queue = dbQueue;
            return dbQueue.setOwner(ownerId);
        }).then(function(result) {
            return editQueueCourses(this.queue, queueObj.courses, associations.set);
        }).then(function(result) {
            return editQueueRooms(this.queue, queueObj.rooms, associations.set);
        }).then(function() {
            return policyAccessor.createDefaultPolicy(this.queue.id,
                policyTypes.ta);
        }).then(function(policy) {
            return policy.addUsers([ownerId]);
        }).then(function() {
            return findQueue(this.queue.id);
        }).catch(function(e) {
            throw e;
        });

    }

    function editQueueMeta(queueId, queueObj) {

        return getDbQueue(queueId).bind({}).then(function(dbQueue) {
            if (!dbQueue) {
                throw new Error("Queue not found");
            }

            if (queueObj.name) {
                dbQueue.name = queueObj.name;
            }
            if (queueObj.description) {
                dbQueue.description = queueObj.description;
            }

            return dbQueue.update({
                name: dbQueue.name,
                description: dbQueue.description
            });
        }).then(function(dbQueue) {
            var id = convertToSlug(dbQueue.name);
            this.id = id;
            return models.Queue.update({
                id: id
            }, {
                where: {
                    id: dbQueue.id
                }
            });
        }).then(function() {
            return findQueue(this.id);
        }).then(function(dbQueue) {
            this.queue = dbQueue;
            var courseOp = queueObj.courses;
            if (queueObj.courses && _.isArray(queueObj.courses)) {
                courseOp = patchUtils.createPatchFromArray(queueObj.courses);
            }
            if (!courseOp) {
                return Promise.resolve(this.queue);
            }
            if (!patchUtils.validatePatch(courseOp)) {
                throw new patchUtils.InvalidPatchError(
                    "Invalid format for updating courses");
            }
            return editQueueCourses(this.queue, courseOp.values, courseOp.op);
        }).then(function(result) {
            var roomOp = queueObj.rooms;
            if (queueObj.rooms && _.isArray(queueObj.rooms)) {
                roomOp = patchUtils.createPatchFromArray(queueObj.rooms);
            }
            if (!roomOp) {
                return findQueue(this.queue.id);
            }
            if (!patchUtils.validatePatch(roomOp)) {
                throw new patchUtils.InvalidPatchError(
                    "Invalid format for updating rooms");
            }
            var self = this;
            return editQueueRooms(this.queue, roomOp.values, roomOp.op).then(function() {
                return findQueue(self.queue.id);
            });
        });

    }

    function changeQueueOwner(queueId, ownerId) {
        return getDbQueue(queueId).then(function(dbQueue) {
            return dbQueue.setOwner(ownerId);
        });
    }

    function editQueueCourses(dbQueueOrQueueId, courses, op) {

        return Promise.map(courses, function(course) {
            return courseAccessor.createOrFindCourse(course);
        }).bind({}).then(function(dbCourses) {
            this.courses = dbCourses;
            return getDbQueue(dbQueueOrQueueId);
        }).then(function(dbQueue) {
            switch (op) {
                case associations.set:
                    return dbQueue.setCourses(this.courses);
                    break;
                case associations.add:
                    return dbQueue.addCourses(this.courses);
                    break;
                case associations.remove:
                    return dbQueue.removeCourses(this.courses);
                    break;
                default:
                    return Promise.reject(new Error(
                        'Invalid operation when patching courses'));
            }
        });

    }

    function editQueueRooms(dbQueueOrQueueId, rooms, op) {
        return Promise.map(rooms, function(room) {
            return roomAccessor.createOrFindRoom(room);
        }).bind({}).then(function(dbRooms) {
            this.rooms = dbRooms;
            return getDbQueue(dbQueueOrQueueId);
        }).then(function(dbQueue) {
            switch (op) {
                case associations.set:
                    return dbQueue.setRooms(this.rooms);
                    break;
                case associations.add:
                    return dbQueue.addRooms(this.rooms);
                    break;
                case associations.remove:
                    return dbQueue.removeRooms(this.rooms);
                    break;
                default:
                    return Promise.reject(new Error(
                        'Invalid operation when patching rooms'));
            }
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
            if (!courseId) {
                return Promise.resolve();
            }
            return this.request.setCourse(courseId);
        }).then(function() {
            if (!roomId) {
                return Promise.resolve();
            }
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
            },
            include: [{
                model: models.User,
                as: 'author',
                attributes: ['id', 'name']
            }]
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
            },
            include: [{
                model: models.User,
                as: 'author',
                attributes: ['id', 'name']
            }]
        });
    }

    function findActiveRequestsThatMatchRule(queueId, rule) {
        return models.Request.findAll({
            where: {
                queueId: queueId,
                status: requestStatuses.in_queue,
                courseId: {
                    $in: rule.courses
                },
                roomId: {
                    $in: rule.rooms
                }
            },
            include: [{
                model: models.User,
                as: 'author',
                attributes: ['id', 'name']
            }]
        })
    }

    function findActiveRequestsInQueue(queueId) {
        return models.Request.findAll({
            where: {
                queueId: queueId,
                status: requestStatuses.in_queue
            },
            include: [{
                model: models.User,
                as: 'author',
                attributes: ['id', 'name']
            }]
        });
    }

    function findRequestHistory(queueId) {
        return models.Request.findAll({
            where: {
                queueId: queueId
            },
            include: [{
                model: models.User,
                as: 'author',
                attributes: ['id', 'name']
            }]
        });
    }

    function changeRequestStatus(queueId, requestId, status, editorUserId) {
        return findRequest(queueId, requestId).bind({}).then(function(request) {
            if (!request) {
                throw new RequestNotFoundError();
            }

            return request.update({
                status: status
            });

        }).then(function(request) {
            this.request = request;
            if (editorUserId) {
                return request.setHelper(editorUserId);
            }
            else {
                return Promise.resolve(request);
            }
        }).then(function() {
            return this.request.reload();
        })
    }

    return {
        RequestNotFoundError: RequestNotFoundError,
        RequestAlreadyExistsError: RequestAlreadyExistsError,
        InvalidQueueError: InvalidQueueError,

        findActiveRequestsInQueue: findActiveRequestsInQueue,
        findActiveRequestByAuthor: findActiveRequestByAuthor,

        createQueue: createQueue,
        findQueue: findQueue,

        editQueueMeta: editQueueMeta,
        editQueueCourses: editQueueCourses,
        editQueueRooms: editQueueRooms,

        findRequest: findRequest,
        findRequestHistory: findRequestHistory,
        createRequest: createRequest,
        changeRequestStatus: changeRequestStatus
    };

}
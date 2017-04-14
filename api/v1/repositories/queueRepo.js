'use strict';

const requestStatuses = require('../../../enums/requestStatuses');

module.exports = function(models) {

    // ERRORS
    //////////
    var RequestNotFoundError = function() {
        Error.apply(this, arguments);
    };

    var RequestAlreadyExistsError = function() {
        Error.apply(this, arguments);
    };

    // METHODS
    ////////////

    function createQueue(queueObj, ownerId) {
        return models.Queue.create(queueObj).then(function(dbQueue) {
            return dbQueue.setOwner(ownerId).then(function() {
                return dbQueue.save();
            });
        });
    }

    function createRequest(requestObj, queueId, authorId) {

        return findActiveRequestByAuthor(queueId, authorId).then(
                function(request) {
                    if (!request) {
                        return models.Request.create(requestObj);
                    }
                    else {
                        throw new RequestAlreadyExistsError();
                    }
                })
            .then(function(request) {
                return request.setQueue(queueId).then(function() {
                    return request.setAuthor(authorId).then(
                        function() {
                            return request.save();
                        });
                });
            })
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

    function changeRequestStatus(queueId, authorId, status, editorUserId) {
        return findActiveRequestByAuthor(queueId, authorId).then(function(request) {
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

        findCurrentRequestsInQueue: findCurrentRequestsInQueue,
        findActiveRequestByAuthor: findActiveRequestByAuthor,
        createQueue: createQueue,
        createRequest: createRequest,
        changeRequestStatus: changeRequestStatus
    };

}
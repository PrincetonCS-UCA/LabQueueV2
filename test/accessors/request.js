var assert = require('assert');
var should = require('should');

const db = require('../../models');

const requestStatuses = require('../../enums/requestStatuses');

describe("Loading Queue Accessor", function() {
    var accessor;
    var casId = 'test';
    var taId = 'ta';
    var userAccessor;

    before(function(done) {
        accessor = require('../../api/v1/accessors/queueAccessor')(db);
        userAccessor = require('../../api/v1/accessors/userAccessor')(db);

        db.sequelize.sync({
            force: true
        }).then(function() {
            userAccessor.createUser(casId, "Test", "test").then(function() {
                return userAccessor.createUser(taId, "TA", "ta");
            }).then(function() {
                done();
            });
        });

    });

    describe("Request Creation", function() {

        var queueId = "test";
        before(function(done) {
            db.Queue.destroy({
                truncate: true
            }).then(function() {
                var q = {
                    name: queueId,
                    description: "This is a test queue",
                    courses: ['126', '226', '217'],
                    rooms: ['121', '122']
                };
                accessor.createQueue(q, taId).then(function(queue) {
                    console.log(queue.toJSON());
                    done();
                }).catch(function(err) {
                    done(err);
                });
            });
        });

        beforeEach(function(done) {
            db.Request.destroy({
                truncate: true
            }).then(function() {
                done();
            });
        });

        it("should create a single request", function(done) {

            var r = {
                message: "This is a request"
            }
            accessor.createRequest(r, queueId, casId, '126', '121').then(
                function(request) {
                    assert.equal(request.message, r.message);
                    assert.equal(request.queueId, queueId);
                    assert.equal(request.authorId, casId);
                    assert.equal(request.status, requestStatuses.in_queue);
                    done();
                }).catch(function(err) {
                done(err);
            });
        });

        it("should create requests from multiple students", function(done) {

            var r = {
                message: "This is a request"
            };
            var r2 = {
                message: "This is a request 2"
            };
            accessor.createRequest(r, queueId, casId, '126', '121').then(
                function(request) {
                    assert.equal(request.message, r.message);
                    assert.equal(request.queueId, queueId);
                    assert.equal(request.authorId, casId);
                    assert.equal(request.status, requestStatuses.in_queue);
                    return accessor.createRequest(r2, queueId, taId, '226', '121');
                }).then(function(request) {
                assert.equal(request.message, r2.message);
                assert.equal(request.queueId, queueId);
                assert.equal(request.authorId, taId);
                assert.equal(request.status, requestStatuses.in_queue);
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        it("should not allow a student to create more than one request at a time",
            function(done) {
                var r = {
                    message: "This is a request"
                }
                var r2 = {
                    message: "This is a second request"
                }
                accessor.createRequest(r, queueId, casId, '126', '121').then(
                    function(request) {
                        assert.equal(request.message, r.message);
                        assert.equal(request.queueId, queueId);
                        assert.equal(request.authorId, casId);
                        assert.equal(request.status, requestStatuses.in_queue);
                        accessor.createRequest(r2, queueId, casId, '126',
                            '121').then(function() {
                            done(new Error(
                                "Should not create more than one request."
                            ));
                        }).catch(function(err) {
                            done();
                        })
                    }).catch(function(err) {
                    done(err);
                });
            });

        it("should allow a student to cancel request, then create a new one",
            function(done) {
                var r = {
                    message: "This is a request"
                };
                accessor.createRequest(r, queueId, casId, '126', '121').then(function(request) {
                    return accessor.changeRequestStatus(queueId, request.id, requestStatuses.canceled);
                }).then(function(request) {
                    assert.equal(request.status, requestStatuses.canceled);
                    console.log(request.helperId);
                    should.not.exist(request.helperId);
                    assert.equal(request.authorId, casId);

                    return accessor.createRequest(r, queueId, casId, '126', '121');
                }).then(function(request) {
                    assert.equal(request.authorId, casId);
                    return accessor.findRequestHistory(queueId);
                }).then(function(requests) {
                    assert.equal(requests.length, 2);
                    done();
                }).catch(function(err) {
                    done(err);
                });
            });

    });
});
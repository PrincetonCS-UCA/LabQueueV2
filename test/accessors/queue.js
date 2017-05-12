var assert = require('assert');
var should = require('should');

const db = require('../../models');

describe("Loading Queue Accessor", function() {
    var accessor;
    var casId = 'test';
    var userAccessor;

    before(function(done) {
        accessor = require('../../api/v1/accessors/queueAccessor')(db);
        userAccessor = require('../../api/v1/accessors/userAccessor')(db);

        db.sequelize.sync({
            force: true
        }).then(function() {
            userAccessor.createUser(casId, "Test", "test").then(function() {
                done();
            });
        });

    });

    describe("Queue Creation", function() {

        beforeEach(function(done) {
            db.Queue.destroy({
                truncate: true
            }).then(function() {
                done();
            });
        });

        it("should create a single queue", function(done) {
            var q = {
                name: "Test Queue",
                description: "This is a test queue",
                courses: ['126', '226', '217'],
                rooms: ['121', '122']
            };
            accessor.createQueue(q, casId).then(function(queue) {
                should(queue).have.property('name', q.name);
                should(queue).have.property('description', q.description);
                should(queue).have.property('courses').with.lengthOf(
                    3);
                should(queue).have.property('rooms').with.lengthOf(
                    2);
                done();
            });
        });

        it("should not create duplicate queues", function(done) {
            var q = {
                name: "Test Queue",
                description: "This is a test queue",
                courses: ['126', '226', '217'],
                rooms: ['121', '122']
            };
            accessor.createQueue(q, casId).then(function(queue) {
                should(queue).have.property('name', q.name);
                should(queue).have.property('description', q.description);
                should(queue).have.property('courses').with.lengthOf(
                    3);
                should(queue).have.property('rooms').with.lengthOf(
                    2);
                return accessor.createQueue(q, casId);
            }).then(function(queue) {
                // should fail
                assert(false);
                done();
            }).catch(function(err) {
                should.exist(err);
                done();
            });
        })
    });

    describe("Queue Editing", function() {
        var queueId = "test";
        beforeEach(function(done) {
            db.Queue.destroy({
                truncate: true
            }).then(function() {
                var q = {
                    name: queueId,
                    description: "This is a test queue",
                    courses: ['126', '226', '217'],
                    rooms: ['121', '122']
                };
                accessor.createQueue(q, casId).then(function(queue) {
                    done();
                });
            });
        });

        it("should change name and description", function(done) {
            q = {
                name: "Something else",
                description: "Something else 2"
            };
            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('name', q.name);
                should(queue).have.property('description', q.description);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should change name without description", function(done) {
            q = {
                name: "Something else"
            };
            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('name', q.name);
                should(queue).have.property('description',
                    "This is a test queue");
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should not allow you to change name to another queue's name", function(
            done) {
            var q = {
                name: "test2",
                description: "This is a test queue"
            };
            accessor.createQueue(q, casId).then(function(queue) {
                return accessor.editQueueMeta(queueId, q).then(
                    function(queue) {
                        assert(false);
                        done(new Error(
                            "This should not have succeeded."
                        ))
                    })
            }).catch(function(errors) {
                done();
            });
        })

        it("should add courses properly", function(done) {
            q = {
                courses: {
                    op: "add",
                    values: ['426']
                }
            };

            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('courses').with.lengthOf(
                    4);
                should(queue).have.property('rooms').with.lengthOf(
                    2);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should set courses properly", function(done) {
            q = {
                courses: {
                    op: "set",
                    values: ['426', '126']
                }
            };

            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('courses').with.lengthOf(
                    2);
                should(queue).have.property('rooms').with.lengthOf(
                    2);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should remove courses properly", function(done) {
            q = {
                courses: {
                    op: "remove",
                    values: ['126', '226']
                }
            };

            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('courses').with.lengthOf(
                    1);
                should(queue).have.property('rooms').with.lengthOf(
                    2);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should add rooms properly", function(done) {
            q = {
                rooms: {
                    op: "add",
                    values: ['123']
                }
            };

            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('courses').with.lengthOf(
                    3);
                should(queue).have.property('rooms').with.lengthOf(
                    3);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should set rooms properly", function(done) {
            q = {
                rooms: {
                    op: "set",
                    values: ['426', '126']
                }
            };

            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('courses').with.lengthOf(
                    3);
                should(queue).have.property('rooms').with.lengthOf(
                    2);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should remove rooms properly", function(done) {
            q = {
                rooms: {
                    op: "remove",
                    values: ['121']
                }
            };

            accessor.editQueueMeta(queueId, q).then(function(queue) {
                should(queue).have.property('courses').with.lengthOf(
                    3);
                should(queue).have.property('rooms').with.lengthOf(
                    1);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

    });

})
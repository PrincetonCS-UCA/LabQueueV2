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
                accessor.createQueue(q, casId).then(function(queue) {
                    console.log(queue.toJSON());
                    done();
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
            done("unimplemented");
        });

    });
});
var assert = require('assert');
var should = require('should');

const db = require('../../models');
const policyTypes = require('../../enums/policyTypes');

describe("Loading Policy Accessor", function() {
    var accessor;
    var casId = 'test';
    var queueId = 'testqueue';
    var userAccessor;

    before(function(done) {
        accessor = require('../../api/v1/accessors/policyAccessor')(db);
        queueAccessor = require('../../api/v1/accessors/queueAccessor')(db);
        userAccessor = require('../../api/v1/accessors/userAccessor')(db);

        db.sequelize.sync({
            force: true
        }).then(function() {
            return userAccessor.createUser(casId, "Test", "test");
        }).then(function() {
            var q = {
                name: queueId,
                description: "This is a test queue",
                courses: ['126', '226', '217'],
                rooms: ['121', '122']
            };
            return queueAccessor.createQueue(q, casId);
        }).then(function() {
            done();
        });

    });

    describe('Policy Creation', function() {
        it('should create a policy in the queue', function(done) {

            var rule = {
                courses: ['126'],
                rooms: ['121']
            }
            accessor.createOrUpdatePolicy(queueId,
                    '126 Grad Student', policyTypes.ta, [rule])
                .then(function(policy) {
                    assert.equal(policy.name,
                        '126 Grad Student');
                    assert.equal(policy.queueId,
                        queueId);

                    return accessor.findPolicy(
                        queueId, policyTypes.ta, [
                            rule
                        ]);
                }).then(function(policy) {
                    should.exist(policy);
                    done();
                });

        });
    });

})
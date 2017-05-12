var assert = require('assert');
var should = require('should');

const db = require('../../models');
const policyTypes = require('../../enums/policyTypes');

describe("Loading Policy Accessor", function() {
    var accessor;
    var casId = 'test';
    var casId2 = 'test2';
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
            return userAccessor.createUser(casId2, "Test2", "test2");
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
        beforeEach(function(done) {
            db.Policy.destroy({
                truncate: true
            }).then(function() {
                done();
            })
        });

        it('should have a default policy in the queue', function(done) {
            accessor.createDefaultPolicy(queueId, policyTypes.ta).then(
                function(policy) {
                    var rules = JSON.parse(policy.rules);

                    assert.equal(rules.length, 1);
                    assert.equal(rules[0].courses.length, 3);
                    assert.equal(rules[0].rooms.length, 2);
                    return accessor.findAllPoliciesForQueue(queueId);
                }).then(function(policies) {
                console.log(policies);
                should(policies.length).equal(1);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

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
                }).catch(function(errors) {
                    done(errors);
                });

        });

        it('should not duplicate policies in the queue', function(done) {

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

                    return accessor.createOrUpdatePolicy(
                        queueId, 'Renamed policy', policyTypes.ta, [
                            rule
                        ]);
                }).then(function(policy) {
                    should.exist(policy);
                    assert.equal(policy.name, 'Renamed policy');
                    return accessor.findAllPoliciesForQueue(queueId);

                }).then(function(policies) {
                    should(policies.length).equal(1);
                    done();
                }).catch(function(errors) {
                    done(errors);
                });

        });

        it('should create a policy with multiple rules in the queue', function(done) {

            var rule = {
                courses: ['126'],
                rooms: ['121']
            }
            var rule2 = {
                courses: ['217', '226'],
                rooms: ['121', '122']
            }
            var rules = [rule, rule2];
            var rules2 = [rule2, rule];
            accessor.createOrUpdatePolicy(queueId,
                    '126 Grad Student', policyTypes.ta, rules)
                .then(function(policy) {
                    assert.equal(policy.name,
                        '126 Grad Student');
                    assert.equal(policy.queueId,
                        queueId);

                    return accessor.findPolicy(
                        queueId, policyTypes.ta, rules);
                }).then(function(policy) {
                    should.exist(policy);
                    done();
                }).catch(function(errors) {
                    done(errors);
                });

        });
    });

})
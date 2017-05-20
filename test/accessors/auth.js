var assert = require('assert');
var should = require('should');

const db = require('../../models');
const policyTypes = require('../../enums/policyTypes');
const associations = require('../../enums/associations');

describe("Setup Accessors", function() {
    var accessor;
    var casId = 'test';
    var taId = 'ta';
    var queueId = 'testqueue';
    var userAccessor;
    var queueAccessor;
    var policyAccessor;

    before(function(done) {
        policyAccessor = require('../../api/v1/accessors/policyAccessor')(db);
        queueAccessor = require('../../api/v1/accessors/queueAccessor')(db);
        userAccessor = require('../../api/v1/accessors/userAccessor')(db);
        accessor = require('../../api/v1/accessors/authAccessor')(db);

        db.sequelize.sync({
            force: true
        }).then(function() {
            return userAccessor.createUser(casId, "Test", "test");
        }).then(function() {
            return userAccessor.createUser(taId, "Test2", "test2");
        }).then(function() {
            var q = {
                name: queueId,
                description: "This is a test queue",
                courses: ['126', '226', '217'],
                rooms: ['121', '122']
            };
            return queueAccessor.createQueue(q, casId);
        }).then(function() {
            return policyAccessor.createDefaultPolicy(queueId, policyTypes.ta);
        }).then(function(policy) {
            return policy.setUsers([taId]);
        }).then(function() {
            done();
        }).catch(function(err) {
            done(err);
        });

    });

    describe("Testing TA functionality", function(done) {
        var requestObj;
        beforeEach(function(done) {
            db.Request.destroy({
                truncate: true
            }).then(function() {
                var r = {
                    message: "New Request"
                };
                queueAccessor.createRequest(r, queueId, casId, '126', '121').then(function(request) {
                    requestObj = request;
                    done();
                });
            })

        })
        it("should not allow a non-TA to edit the request", function(done) {
            accessor.canHelpRequest(requestObj, casId).then(function(canHelp) {
                assert.equal(canHelp, false);
                return accessor.canHelpRequest(requestObj, taId);
            }).then(function(canHelp) {
                assert.equal(canHelp, true);
                done();
            }).catch(function(err) {
                done(err);
            })
        })

        it("should not allow a TA without the correct policy to edit the request", function(done) {
            var rule = {
                courses: ['126'],
                rooms: ['121']
            }

            var policy = {
                name: '126 Grad Student',
                role: policyTypes.ta,
                rules: [rule],
                users: {
                    op: associations.set,
                    values: [taId]
                }
            }
            policyAccessor.createOrUpdatePolicy(queueId, policy).then(function(policy) {
                return accessor.canHelpRequest(requestObj, casId);
            }).then(function(canHelp) {
                assert.equal(canHelp, false);
                return accessor.canHelpRequest(requestObj, taId);
            }).then(function(canHelp) {
                assert.equal(canHelp, true);
                policy.rules = [{
                    courses: ['226'],
                    rooms: ['121']
                }];
                policy.name = '226 Grad Student';
                return policyAccessor.createOrUpdatePolicy(queueId, policy);
            }).then(function(policy) {
                return accessor.canHelpRequest(requestObj, taId);
            }).then(function(canHelp) {
                assert.equal(canHelp, false);
                done();
            }).catch(function(err) {
                done(err);
            })
        })
    });

})
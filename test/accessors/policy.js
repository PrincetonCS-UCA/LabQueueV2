var assert = require('assert');
var should = require('should');

const db = require('../../models');
const policyTypes = require('../../enums/policyTypes');
const associations = require('../../enums/associations');

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

            var policy = {
                name: '126 Grad Student',
                role: policyTypes.ta,
                rules: [rule]
            }
            accessor.createOrUpdatePolicy(queueId,
                    policy)
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
                    return accessor.createDefaultPolicy(queueId,
                        policyTypes.ta);
                }).then(function(policy) {
                    var rules = JSON.parse(policy.rules);

                    assert.equal(rules.length, 1);
                    assert.equal(rules[0].courses.length, 3);
                    assert.equal(rules[0].rooms.length, 2);
                    return accessor.findAllPoliciesForQueue(queueId);
                }).then(function(policies) {

                    assert.equal(policies.length, 2);
                    done();
                }).catch(function(errors) {
                    done(errors);
                });

        });

        it('should create multiple policies in the queue', function(done) {

            var rule = {
                courses: ['126'],
                rooms: ['121']
            }

            var policy = {
                name: '126 Grad Student',
                role: policyTypes.ta,
                rules: [rule]
            }

            accessor.createOrUpdatePolicy(queueId,
                    policy)
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

            var policy = {
                name: '126 Grad Student',
                role: policyTypes.ta,
                rules: [rule]
            }

            var policy2 = {
                name: 'Renamed policy',
                role: policyTypes.ta,
                rules: [rule]
            }
            accessor.createOrUpdatePolicy(queueId,
                    policy)
                .then(function(policy) {
                    assert.equal(policy.name,
                        '126 Grad Student');
                    assert.equal(policy.queueId,
                        queueId);

                    return accessor.createOrUpdatePolicy(
                        queueId, policy2);
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

            var policy = {
                name: '126 Grad Student',
                role: policyTypes.ta,
                rules: rules
            }
            accessor.createOrUpdatePolicy(queueId,
                    policy)
                .then(function(policy) {
                    assert.equal(policy.name,
                        '126 Grad Student');
                    assert.equal(policy.queueId,
                        queueId);

                    return accessor.findPolicy(
                        queueId, policyTypes.ta, rules2);
                }).then(function(policy) {
                    should.exist(policy);
                    done();
                }).catch(function(errors) {
                    done(errors);
                });

        });

        it("should produce an error if the policy is invalid", function(done) {
            var rule = {
                courses: ['126'],
                rooms: ['121']
            }
            var policy = {
                name: "Invalid 1",
                rules: [rule]
            };

            var policy2 = {
                name: "Invalid 2",
                role: policyTypes.ta
            };

            accessor.createOrUpdatePolicy(queueId, policy).then(function(
                policy) {
                console.log(policy.toJSON());
                done(new Error("Created policy with no role"));
            }).catch(function(error) {
                accessor.createOrUpdatePolicy(queueId, policy2).then(
                    function() {
                        done(new Error(
                            "Created policy with no rules"
                        ))
                    }).catch(function(err) {
                    done();
                })
            })
        })
    });

    describe('Changing Policy Users', function() {

        var rule = {
            courses: ['126'],
            rooms: ['121']
        }
        var rule2 = {
            courses: ['217', '226'],
            rooms: ['121', '122']
        }

        beforeEach(function(done) {

            var policy = {
                name: '126 Grad Student',
                role: policyTypes.ta,
                rules: [rule]
            }

            var policy2 = {
                name: 'No 217',
                role: policyTypes.ta,
                rules: [rule2]
            }
            db.Policy.destroy({
                truncate: true
            }).then(function() {
                return accessor.createOrUpdatePolicy(queueId,
                    policy);

            }).then(function(policy) {
                return accessor.createOrUpdatePolicy(queueId,
                    policy2);
            }).then(function() {
                done();
            });
        });

        it("Should be able to set policy users", function(done) {

            var policy = {
                rules: [rule],
                role: policyTypes.ta,
                users: {
                    op: associations.set,
                    values: [casId]
                }
            };

            accessor.createOrUpdatePolicy(queueId, policy).then(function(
                policy) {
                return policy.getUsers();
            }).then(function(users) {
                assert.equal(users.length, 1);

                var policy2 = {
                    rules: [rule],
                    role: policyTypes.ta,
                    users: {
                        op: associations.add,
                        values: [casId2]
                    }
                };
                return accessor.createOrUpdatePolicy(queueId,
                    policy2);
            }).then(function(policy) {
                return policy.getUsers();
            }).then(function(users) {
                assert.equal(users.length, 2);
                done();
            }).catch(function(error) {
                done(error);
            })
        });

        it("Should be able to set multiple policy users", function(done) {

            var policy = {
                rules: [rule],
                role: policyTypes.ta,
                users: {
                    op: associations.set,
                    values: [casId, casId2]
                }
            };

            accessor.createOrUpdatePolicy(queueId, policy).then(function(
                policy) {
                return policy.getUsers();
            }).then(function(users) {
                assert.equal(users.length, 2);
                done();
            }).catch(function(error) {
                done(error);
            })
        });

        it("should not have users in more than one policy at a time", function(done) {
            var policy = {
                rules: [rule],
                role: policyTypes.ta,
                users: {
                    op: associations.set,
                    values: [casId]
                }
            };

            var policy2 = {
                rules: [rule2],
                role: policyTypes.ta,
                users: {
                    op: associations.add,
                    values: [casId]
                }
            };

            var p1;

            accessor.createOrUpdatePolicy(queueId, policy).then(function(
                dbPolicy) {
                p1 = dbPolicy;
                return dbPolicy.getUsers();
            }).then(function(users) {
                assert.equal(users.length, 1);
                return accessor.createOrUpdatePolicy(queueId,
                    policy2);
            }).then(function(dbPolicy2) {
                return dbPolicy2.getUsers();
            }).then(function(users) {
                assert.equal(users.length, 1);
                return p1.reload();
            }).then(function(dbPolicy) {
                return dbPolicy.getUsers();
            }).then(function(users) {
                assert.equal(users.length, 0);
                done();
            }).catch(function(errors) {
                done(errors);
            });
        });

        it("should produce an error if an invalid op is used", function(done) {
            var policy = {
                rules: [rule],
                role: policyTypes.ta,
                users: {
                    op: "invalid",
                    values: [casId, casId2]
                }
            };

            accessor.createOrUpdatePolicy(queueId, policy).then(function(
                policy) {
                done(new Error(
                    "We weren't supposed to be able to do this..."
                ))
            }).catch(function(error) {
                done();
            })
        })

    });
})
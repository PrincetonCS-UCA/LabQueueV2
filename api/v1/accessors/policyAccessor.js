'use strict';

const Validator = require('jsonschema').Validator;
var v = new Validator();

const _ = require('lodash');

const Promise = require('bluebird');

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');
const associations = require('../../../enums/associations');

const getArraysOfIds = require('../../../utils/getArraysOfIds');

const ruleUtils = require('./utils/rules');

module.exports = function(models) {

    // ERRORS
    //////////
    var OperationNotSupportedError = function() {
        Error.apply(this, arguments);
    };

    function createOrUpdatePolicy(queueId, name, role, rules) {
        return findPolicy(queueId, role, rules).then(function(policy) {
            if (policy) {
                name = name || policy.name;
                return policy.update({
                    name: name
                });
            }
            else {
                return models.Policy.create({
                    name: name || "Unnamed Policy",
                    role: role,
                    rules: JSON.stringify(rules)
                })
            }
        }).then(function(dbPolicy) {
            return dbPolicy.setQueue(queueId).then(function() {
                return Promise.resolve(dbPolicy);
            });
        });
    }

    function getDefaultRulesForQueue(queueId) {
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
        }).then(function(dbQueue) {
            var rule = {
                courses: getArraysOfIds(dbQueue.courses),
                rooms: getArraysOfIds(dbQueue.rooms)
            };
            return Promise.resolve(rule);
        });
    }

    function createDefaultPolicy(queueId, role) {
        return getDefaultRulesForQueue(queueId).then(function(rule) {
            return createOrUpdatePolicy(queueId, "default", role, [rule]);
        })
    }

    /**
     * Returns all policies that match the given role, and can interact with the 
     * request (e.g. has a rule that matches the courses and rooms of the request)
     */
    function findPoliciesThatFitRequest(queueId, role, request) {
        return models.Policy.findAll({
            where: {
                queueId: queueId,
                role: role
            },
            include: [{
                model: models.User,
                attributes: ['id', 'name'],
                through: {
                    attributes: []
                }
            }]
        }).then(function(policies) {
            // take out those that don't match the rules

            var matchingPolicies = [];
            for (var i = 0; i < policies.length; i++) {
                var rules = JSON.parse(policies[i].rules);
                if (ruleUtils.fitsRulesList(request, rules)) {
                    matchingPolicies.push(policies[i]);
                }
            }

            return Promise.resolve(matchingPolicies);
        });
    }

    function findPolicyById(policyId) {
        return models.Policy.findOne({
            where: {
                id: policyId
            },
            include: [{
                model: models.User,
                attributes: ['id', 'name'],
                through: {
                    attributes: []
                }
            }]
        });
    }

    // TODO: eventually, we want to have a more solid contract ensuring that
    // there is only one policy per user per queue. In the meantime, though
    // we return an array.
    function findPoliciesByUser(queueId, casId) {
        return models.Policy.findAll({
            where: {
                queueId: queueId
            },
            include: [{
                model: models.User,
                attributes: [],
                through: {
                    attributes: []
                },
                where: {
                    'id': casId
                }
            }]
        });
    }

    // TODO: Test this!
    function findPolicy(queueId, role, rules) {
        return models.Policy.findAll({
            where: {
                queueId: queueId,
                role: role
            },
            include: [{
                model: models.User,
                attributes: ['id', 'name'],
                through: {
                    attributes: []
                }
            }]
        }).then(function(policies) {
            for (var i = 0; i < policies.length; i++) {
                var policy = policies[i];
                var r = JSON.parse(policy.rules);
                if (_.isEqual(r.sort(), rules.sort())) {
                    return Promise.resolve(policy);
                }
            }
            return Promise.resolve(null);
        });
    }

    function findAllPoliciesForQueue(queueId) {
        return models.Policy.findAll({
            where: {
                queueId: queueId
            },
            include: [{
                model: models.User,
                attributes: ['id', 'name'],
                through: {
                    attributes: []
                }
            }]
        });
    }

    function editPolicy(queueId, name, role, rules, userIds, operation) {

        function performOp(policy, userIds, op) {
            switch (op) {
                case associations.add:
                    return removeUsersFromOtherPolicies(queueId, userIds).then(function() {
                        return policy.addUsers(userIds);
                    });
                    break;
                case associations.set:
                    return removeUsersFromOtherPolicies(queueId, userIds).then(function() {
                        return policy.setUsers(userIds);
                    });
                    break;
                case assocations.remove:
                    return policy.removeUsers(userIds);
                    break;
                default:
                    throw new OperationNotSupportedError();

            }
        }

        function removeUsersFromOtherPolicies(queueId, userIds) {
            return Promise.map(userIds, function(userId) {
                return findPoliciesByUser(queueId, userId).then(function(policies) {
                    return Promise.map(policies, function(policy) {
                        return policy.removeUsers([userId]);
                    });
                });
            });
        }

        // TODO: use remove and add and set for the same thing here!
        return findPolicy(queueId, role, rules).then(function(policy) {
            return createOrUpdatePolicy(queueId, name, roles, rules).then(
                function(dbPolicy) {
                    return dbPolicy.setQueue(queueId).then(function() {
                        return performOp(dbPolicy, userIds, operation);
                    }).then(function() {
                        return dbPolicy.save();
                    });
                });

        })
    }

    return {
        createOrUpdatePolicy: createOrUpdatePolicy,
        createDefaultPolicy: createDefaultPolicy,

        getDefaultRulesForQueue: getDefaultRulesForQueue,

        findPolicy: findPolicy,
        findPolicyById: findPolicyById,
        findPoliciesByUser: findPoliciesByUser,
        findAllPoliciesForQueue: findAllPoliciesForQueue,
        findPoliciesThatFitRequest: findPoliciesThatFitRequest,
        editPolicy: editPolicy
    };

}
'use strict';

var validate = require('jsonschema').validate;

const _ = require('lodash');

const Promise = require('bluebird');

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');
const associations = require('../../../enums/associations');

const getArraysOfIds = require('../../../utils/getArraysOfIds');

const ruleUtils = require('./utils/rules');
const patchUtils = require('./utils/patchOps');

const makeError = require('make-error');

module.exports = function(models) {

    var policySchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            role: {
                type: 'string',
                required: true
            },
            rules: {
                type: 'array',
                required: true,
                'items': {
                    'type': 'object'
                }
            },
            users: {
                type: 'object'
            }
        }
    };

    // ERRORS
    //////////
    var OperationNotSupportedError = makeError('OperationNotSupportedError');
    var PolicyNotFoundError = makeError('PolicyNotFoundError');
    var InvalidPolicyError = makeError('InvalidPolicyError');

    // users in the policyObj should be a patchObj
    function createOrUpdatePolicy(queueId, policyObj) {

        if (!validate(policyObj, policySchema).valid) {

            return Promise.reject(new InvalidPolicyError());
        }
        return findPolicy(queueId, policyObj.role, policyObj.rules).then(function(policy) {
            if (policy) {
                var name = policyObj.name || policy.name;
                return policy.update({
                    name: name
                });
            }
            else {
                return models.Policy.create({
                    name: policyObj.name || "Unnamed Policy",
                    role: policyObj.role,
                    rules: JSON.stringify(policyObj.rules)
                })
            }
        }).then(function(dbPolicy) {
            return dbPolicy.setQueue(queueId).then(function() {
                if (!policyObj.users) {
                    return Promise.resolve(dbPolicy);
                }
                if (!patchUtils.validatePatch(policyObj.users)) {
                    throw new patchUtils.InvalidPatchError();
                }
                return updatePolicyUsers(dbPolicy, policyObj.users.values,
                    policyObj.users.op);
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
            var policy = {
                name: "default",
                role: role,
                rules: [rule]
            }
            return createOrUpdatePolicy(queueId, policy);
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
                if (_.isEqual(r.sort(ruleUtils.sortRules), rules.sort(ruleUtils.sortRules))) {
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

    function updatePolicyUsers(dbPolicy, userIds, operation) {

        function performOp(policy, userIds, op) {
            switch (op) {
                case associations.add:
                    return removeUsersFromOtherPolicies(policy.queueId, userIds).then(function() {
                        return policy.addUsers(userIds);
                    });
                    break;
                case associations.set:
                    return removeUsersFromOtherPolicies(policy.queueId, userIds).then(function() {
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

        return performOp(dbPolicy, userIds, operation).then(function() {
            return dbPolicy.save();
        });

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

        OperationNotSupportedError: OperationNotSupportedError,
        PolicyNotFoundError: PolicyNotFoundError
    };

}
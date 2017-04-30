'use strict';

const Validator = require('jsonschema').Validator;
var v = new Validator();

const Promise = require('bluebird');

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');
const associations = require('../../../enums/associations');

const getArraysOfIds = require('../../../utils/getArraysOfIds');

module.exports = function(models) {

    // RULES
    ///////////

    var ruleSchema = {
        'type': 'object',
        'properties': {
            'courses': {
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                }
            },
            'rooms': {
                'type': ['string', 'array'],
                'items': {
                    'type': 'string'
                }
            }
        }
    }

    // ERRORS
    //////////
    var OperationNotSupportedError = function() {
        Error.apply(this, arguments);
    };

    // UTILS
    /////////

    function fitsRule(criteria, rule) {
        // check if the criteria (a rule) fits into the rule

    }

    function createPolicy(queueId, role, rules) {

    }

    function findPoliciesThatFitRules(queueId, rules) {

    }

    function findPolicy(queueId, role) {
        return models.Policy.findOne({
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

    function changePolicyMembers(queueId, role, userIds, operation) {

        function performOp(policy, userIds, op) {
            switch (op) {
                case associations.add:
                    return policy.addUsers(userIds);
                    break;
                case associations.set:
                    return policy.setUsers(userIds);
                    break;
                case assocations.remove:
                    return policy.removeUsers(userIds);
                    break;
                default:
                    throw new OperationNotSupportedError();

            }
        }

        // TODO: use remove and add and set for the same thing here!
        return models.Policy.findOne({
            where: {
                queueId: queueId,
                role: role
            }
        }).then(function(policy) {
            if (policy) {
                // we have the policy already, so just add the user to it
                return performOp(policy, userIds, operation);
            }
            else {
                return models.Policy.create({
                    role: role
                }).then(function(dbPolicy) {
                    return dbPolicy.setQueue(queueId).then(function() {
                        return performOp(dbPolicy, userIds, operation);
                    }).then(function() {
                        return dbPolicy.save();
                    });
                });

            }
        })
    }

    return {
        findPolicy: findPolicy,
        findAllPoliciesForQueue: findAllPoliciesForQueue,
        changePolicyMembers: changePolicyMembers
    };

}

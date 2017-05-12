'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');
const ruleUtils = require('../accessors/utils/rules');

const Validator = require('jsonschema').Validator;
var v = new Validator();

const patchUtils = require('../accessors/utils/patchOps');

const errors = require('feathers-errors');

module.exports = function(app, models) {

    const policyAccessor = require('../accessors/policyAccessor')(models);

    function getPolicies(req, res, next) {
        policyAccessor.findAllPoliciesForQueue(req.queue.id).then(function(
            policies) {
            res.json(policies);
        }).catch(function(e) {
            next(e);
        })
    }

    function getPolicyById(req, res, next) {
        policyAccessor.findPolicyById(req.params.policy).then(function(policy) {
            if (!policy) {
                next(new errors.NotFound());
            }
            else {
                res.json(policy);
            }
        }).catch(function(e) {
            next(e);
        })
    }

    function getPoliciesForUser(req, res, next) {
        policyAccessor.findPoliciesByUser(req.queue.id, req.profile.id).then(function(
            policies) {

            // TODO: figure out how to display the users as well!
            res.json(policies);
        }).catch(function(e) {
            next(e);
        })
    }

    function createPolicy(req, res, next) {
        // TODO

        if (!v.validate(req.body.rules, ruleUtils.ruleSchema).valid) {
            return next(new errors.BadRequest("Policy rules do not match rule schema."));
        }

        if (!policyTypes[req.body.role]) {
            return next(new errors.BadRequest("Unknown policy role. Valid roles include: \n" +
                JSON.stringify(policyTypes)));
        }

        var p = {
            name: req.body.name,
            role: req.body.role,
            rules: req.body.rules
        }

        var userOps = null;
        if (req.body.users) {

        }

        policyAccessor.createOrUpdatePolicy(req.queue.id, p.name, p.role, p.rules).then(
            function(policy) {
                // add users to it if there are any in the request body.
            }).catch(function(err) {
            next(err);
        });

        next(new errors.NotImplemented());
    }

    return {
        getPolicies: getPolicies,
        getPolicyById: getPolicyById,
        getPoliciesForUser: getPoliciesForUser,

        createPolicy: createPolicy
    };
}
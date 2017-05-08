'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');

module.exports = function(app, models) {

    const policyAccessor = require('../accessors/policyAccessor')(models);

    function getPolicies(req, res) {
        policyAccessor.findAllPoliciesForQueue(req.queue.id).then(function(
            policies) {
            res.json(policies);
        }).catch(function(e) {
            res.json(e);
        })
    }

    function getPoliciesForUser(req, res, next) {
        policyAccessor.findPoliciesByUser(req.queue.id, req.profile.id).then(function(
            policy) {
            if (!policy) {
                return next('route');
            }
            // TODO: figure out how to display the users as well!
            res.json(policy);
        }).catch(function(e) {
            res.json(e);
        })
    }

    function createPolicy(req, res) {
        // TODO
        res.send("Unimplemented");
    }

    return {
        getPolicies: getPolicies,
        getPoliciesForUser: getPoliciesForUser,

        createPolicy: createPolicy
    };
}
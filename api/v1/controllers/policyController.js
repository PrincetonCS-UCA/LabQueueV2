'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');

module.exports = function(app, models) {

    const policyRepo = require('../repositories/policyRepo')(models);

    function getPolicies(req, res) {
        policyRepo.findAllPoliciesForQueue(req.queue.id).then(function(
            policies) {
            console.log(policies);

            res.json(policies);
        }).catch(function(e) {
            res.json(e);
        })
    }

    function getOnePolicy(req, res, next) {
        policyRepo.findPolicy(req.queue.id, req.params.role).then(function(
            policy) {
            console.log(policy);
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
        getOnePolicy: getOnePolicy,

        createPolicy: createPolicy
    };
}
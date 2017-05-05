'use strict';

const _ = require('lodash');

const policyTypes = require('../../../enums/policyTypes');

const errors = require('feathers-errors');

module.exports = function(app, models) {

    const policyAccessor = require('../accessors/policyAccessor')(models);
    const ruleUtils = require('../accessors/utils/rules');

    function isRequestAuthor() {

        return function(req, res, next) {
            if (req.user.id === req.request.authorId) {
                return next();
            }
            throw new errors.Forbidden();
        }

    }

    function canHelpRequest() {
        return function(req, res, next) {
            // uses req.queue, req.user, and req.request
            policyAccessor.findPoliciesForUser(req.queue.id, req.user.id).then(
                function(policies) {
                    for (var i = 0; i < policies.length; i++) {
                        var policy = policies[i];
                        var rules = JSON.parse(policy.rules);
                        if (ruleUtils.fitsRulesList(req.request, rules)) {
                            return next();
                        }
                    }
                    throw new errors.Forbidden(
                        "User does not have the authorization to edit this request"
                    );

                }).catch(function(error) {
                throw new errors.Forbidden();
            })
        }
    }

    function canCancelRequest() {
        var hasEditorPermission = canHelpRequest();
        return function(req, res, next) {
            if (req.user.id === req.request.authorId) {
                return next();
            }
            hasEditorPermission(req, res, next);
        }
    }

    function isRole(role) {
        return function(req, res, next) {
            // uses req.queue and req.user
            policyAccessor.findPoliciesForUser(req.queue.id, req.user.id).then(
                function(policies) {
                    for (var i = 0; i < policies.length; i++) {
                        var policy = policies[i];
                        if (policy.role === policyTypes.ta) {
                            return next();
                        }
                    }
                    throw new errors.Forbidden(
                        "User does not have the authorization to perform this operation"
                    );

                }).catch(function(error) {
                throw new errors.Forbidden();
            })
        }
    }
    return {
        isTA: function() {
            return isRole(policyTypes.ta);
        },
        isAdmin: function() {
            return isRole(policyTypes.admin);
        },
        canHelpRequest: canHelpRequest,
        canEditRequest: isRequestAuthor,
        canCancelRequest: canCancelRequest
    }
}
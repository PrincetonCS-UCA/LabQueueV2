'use strict';

const _ = require('lodash');

const policyTypes = require('../../../enums/policyTypes');

const errors = require('feathers-errors');

module.exports = function(app, models) {

    const authAccessor = require('../accessors/authAccessor')(models);
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

            authAccessor.canHelpRequest(req.request, req.user.id).then(function(canHelp) {
                if (canHelp) {
                    return next();
                }
                return next(new errors.Forbidden(
                    "User does not have the authorization to edit this request"
                ));
            }).catch(function(error) {
                next(error);
            });
        }
    }

    function canCancelRequest() {
        return function(req, res, next) {
            authAccessor.canCancelRequest(req.request, req.user.id).then(function(canHelp) {
                if (canHelp) {
                    return next();
                }
                return next(new errors.Forbidden(
                    "User does not have the authorization to cancel this request"
                ));
            }).catch(function(error) {
                next(error);
            });
        }
    }

    function isRole(role) {
        return function(req, res, next) {
            // uses req.queue and req.user

        }
    }
    return {
        isTA: function() {
            return isRole(policyTypes.ta);
        },
        isAdmin: function() {
            return isRole(policyTypes.admin);
        },
        isSiteAdmin: function() {
            return true; // TODO: Implement!
        }
        canHelpRequest: canHelpRequest,
        canEditRequest: isRequestAuthor,
        canCancelRequest: canCancelRequest
    }
}
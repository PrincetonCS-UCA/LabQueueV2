'use strict';

const _ = require('lodash');

module.exports = function(app, models) {

    const policyAccessor = require('../accessors/policyAccessor')(models);
    return {
        isTA: function() {
            // uses req.queue and req.user
        },
        isAdmin: function() {

        },
        canEditRequest: function() {
            // uses req.queue, req.user, and req.request

        }

    }
}
'use strict';

const errors = require('feathers-errors');

module.exports = function(app, models) {

    const authAccessor = require('../accessors/authAccessor')(models);

    function getWSSEKey(req, res) {
        var username = req.user.id;
        var service = req.params.service;

        authAccessor.generateWSSEKey(username, service).then(function(key) {
            var password = key.key;
            res.send(password);
        }).catch(function(error) {
            throw new errors.BadRequest(error);
        });

    }

    return {
        getWSSEKey: getWSSEKey
    }
}
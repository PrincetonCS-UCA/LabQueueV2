'use strict';

module.exports = function(app, models) {

    const authRepo = require('../repositories/authRepo')(models);

    function getWSSEKey(req, res) {
        var username = req.user.id;
        var service = req.params.service;

        console.log(service);

        authRepo.generateWSSEKey(username, service).then(function(key) {
            var password = key.key;
            res.send(password);
        }).catch(function(error) {
            res.status(400, error);
        });

    }

    return {
        getWSSEKey: getWSSEKey
    }
}
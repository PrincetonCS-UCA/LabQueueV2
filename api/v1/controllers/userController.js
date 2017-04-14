'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');

module.exports = function(app, models) {

    function getCurrentUser(req, res) {
        res.json(req.user);
    }

    function createUser(req, res) {
        models.User.create({
            name: "Test User",
            casId: "test-2",
            universityId: "dmliao"
        }).then(function(user) {
            res.json(user);
        }).catch(function(e) {
            res.send(e);
        });
    }

    return {
        getCurrentUser: getCurrentUser,
        createUser: createUser
    };
}
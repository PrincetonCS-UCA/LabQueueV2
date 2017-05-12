'use strict';

const requestStatuses = require('../../../enums/requestStatuses');
const policyTypes = require('../../../enums/policyTypes');

module.exports = function(models) {

    function findUserByCasId(casId) {
        return models.User.findOne({
            where: {
                casId: casId
            }
        });
    }

    function createUser(casId, name, universityId) {
        return models.User.create({
            casId: casId,
            name: name,
            universityId: universityId
        });
    }

    return {
        findUserByCasId: findUserByCasId,
        createUser: createUser
    };

}
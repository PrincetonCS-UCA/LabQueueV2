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

    return {
        findUserByCasId: findUserByCasId
    };

}
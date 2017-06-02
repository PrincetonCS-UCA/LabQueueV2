const crypto = require('crypto');
const ruleUtils = require('./utils/rules');

module.exports = function(models) {

    const policyAccessor = require('./policyAccessor')(models);

    function getWSSEKey(username, service) {
        return models.WSSEKey.findOne({
            where: {
                username: username,
                service: service
            }
        });
    }

    function generateWSSEKey(username, service) {

        return getWSSEKey(username, service).then(function(key) {
            var password = crypto.randomBytes(32).toString('hex');

            if (!key) {
                return models.WSSEKey.create({
                    username: username,
                    service: service,
                    key: password
                });
            }
            return key.update({
                key: password
            });
        })
    }

    function saveNonce(nonce) {
        return clearOldNonces().then(function() {
            return models.WSSEEvent.create({
                nonce: nonce
            });
        });
    }

    function clearOldNonces() {
        return models.WSSEEvent.destroy({
            where: {
                createdAt: {
                    $lt: new Date(new Date() - 24 * 60 * 60 * 1000)
                }
            }
        });
    }

    function canHelpRequest(requestObj, casId) {
        return policyAccessor.findPoliciesByUser(requestObj.queueId, casId, requestObj).then(
            function(policies) {
                for (var i = 0; i < policies.length; i++) {
                    var policy = policies[i];
                    var rules = JSON.parse(policy.rules);
                    if (ruleUtils.fitsRulesList(requestObj, rules)) {
                        return Promise.resolve(true);
                    }
                }
                return Promise.resolve(false);
            });
    }

    function canCancelRequest(requestObj, casId) {
        if (requestObj.authorId === casId) {
            return Promise.resolve(true);
        }
        else {
            return canHelpRequest(requestObj, casId);
        }
    }

    function isRole(queueId, casId, role) {
        return policyAccessor.findPoliciesByUser(queueId, casId).then(
            function(policies) {
                for (var i = 0; i < policies.length; i++) {
                    var policy = policies[i];
                    if (policy.role === role) {
                        return Promise.resolve(true);
                    }
                }
                return Promise.resolve(false);

            });

    }

    return {
        getWSSEKey: getWSSEKey,
        generateWSSEKey: generateWSSEKey,
        saveNonce: saveNonce,

        canHelpRequest: canHelpRequest,
        canCancelRequest: canCancelRequest,
        isRole: isRole
    };
}
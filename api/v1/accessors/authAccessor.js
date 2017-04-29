const crypto = require('crypto');

module.exports = function(models) {

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

    return {
        getWSSEKey: getWSSEKey,
        generateWSSEKey: generateWSSEKey,
        saveNonce: saveNonce
    };
}
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

    return {
        getWSSEKey: getWSSEKey,
        generateWSSEKey: generateWSSEKey
    };
}
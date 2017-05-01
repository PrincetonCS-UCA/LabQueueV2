const Promise = require('bluebird');

const getProp = require('../../../../utils/getProp');
const wsse = require('../../../../vendor/wsse');

function verifyWSSERequest(headers) {
    var header = getProp(headers, "X-WSSE");
    var re =
        /UsernameToken +Username="(.+)", *PasswordDigest="(.+)", *Nonce="(.+)", *Created="(.+)"/g;

    var match = re.exec(header);
    return match;

}

// usage:
// var wssePromise = require('wssePromise')(models)
// wssePromise(header).then(/* do your thing */)

module.exports = function(models) {
    const authAccessor = require('../../accessors/authAccessor')(models);
    const userAccessor = require('../../accessors/userAccessor')(models);

    return function(headers) {
        if (getProp(headers, "Authorization") &&
            getProp(headers, "Authorization") ==
            'WSSE profile="UsernameToken"') {
            var wsseString = getProp(headers, 'X-WSSE');
            var verify = verifyWSSERequest(headers);

            if (!verify) {
                // return cas.block(req, res, next);
                return Promise.reject({
                    error: "Unauthorized"
                });
            }

            var digest = verify[2];

            var usernameSplit = verify[1].split('+');

            var username = usernameSplit[0];
            var service = "generic";
            if (usernameSplit.length >= 2) {
                service = usernameSplit[1];
            }

            // we assume nonce is in base64 form
            var nonce64 = verify[3];
            var nonce = Buffer.from(nonce64, 'base64').toString('utf-8');

            var created = verify[4];

            // TODO: reject if the timestamp is too old.

            return authAccessor.saveNonce(nonce).then(function() {
                return authAccessor.getWSSEKey(username, service).then(function(
                    key) {
                    if (!key) {
                        return Promise.reject({
                            error: "Unauthorized"
                        });
                    }

                    var password = key.key;

                    var token = new wsse.UsernameToken({
                        username: username + "+" + service,
                        password: password,
                        created: created,
                        nonce: nonce
                    });

                    if (digest === token.getPasswordDigest()) {
                        // successful validation!
                        return userAccessor.findUserByCasId(username).then(
                            function(user) {
                                if (!user) {
                                    return Promise.reject({
                                        error: "Unauthorized"
                                    });
                                }
                                else {
                                    return Promise.resolve(user);
                                }
                            })

                    }

                    return Promise.reject({
                        error: "Unauthorized"
                    });
                }).catch(function(error) {
                    return Promise.reject({
                        error: "Unauthorized"
                    });
                })
            }).catch(function(error) {
                return Promise.reject({
                    error: "Reused Nonce"
                });
            });

        }

        return Promise.reject({
            error: "No WSSE header found. Unauthorized"
        });

    }
}
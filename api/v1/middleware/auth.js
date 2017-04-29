'use strict';

const passport = require('passport');
const models = require('../../../models');
const getProp = require('../../../utils/getProp');
const wsse = require('../../../vendor/wsse');
const authAccessor = require('../accessors/authAccessor')(models);
const userAccessor = require('../accessors/userAccessor')(models);

function verifyWSSERequest(req) {
    var header = getProp(req.headers, "X-WSSE");
    var re =
        /UsernameToken +Username="(.+)", *PasswordDigest="(.+)", *Nonce="(.+)", *Created="(.+)"/g;

    var match = re.exec(header);
    return match;

}

/**
 * Login Required middleware.
 */

// Gives a forbidden error if the user isn't authenticated
exports.casBlock = function(options) {
    return function(req, res, next) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(403).json({
                error: 'Not Authorized'
            });
        }
        next();
    }
}

// Automatically redirects to the login page if the user isn't authenticated
exports.casBounce = function(options) {
    if (typeof options == 'string') {
        options = {
            redirectTo: options
        }
    }
    options = options || {};

    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

    return function(req, res, next) {
        console.log(req.user);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            if (setReturnTo && req.session) {
                req.session.returnTo = req.originalUrl || req.url;
            }
            return res.redirect(url);
        }
        next();
    }
}

// TODO: implement WSSE authentication, since we shouldn't use CAS for an API ._.
exports.isAuthenticated = function(options) {
    return function(req, res, next) {

        if (getProp(req.headers, "Authorization") &&
            getProp(req.headers, "Authorization") ==
            'WSSE profile="UsernameToken"') {
            var wsseString = getProp(req.headers, 'X-WSSE');
            var verify = verifyWSSERequest(req);

            if (!verify) {
                // return cas.block(req, res, next);
                return res.status(401).json({
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

            console.log(service);
            console.log(username);

            // we assume nonce is in base64 form
            var nonce64 = verify[3];
            var nonce = Buffer.from(nonce64, 'base64').toString('utf-8');

            var created = verify[4];

            // TODO: reject if the timestamp is too old.

            authAccessor.saveNonce(nonce).then(function() {
                authAccessor.getWSSEKey(username, service).then(function(key) {
                    if (!key) {
                        return res.status(401).json({
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
                        console.log("VALIDATED");

                        return userAccessor.findUserByCasId(username).then(
                            function(user) {
                                if (!user) {
                                    res.status(401).json({
                                        error: "User doesn't exist"
                                    });
                                }
                                else {
                                    req.user = user;
                                    return next();
                                }
                            })

                    }

                    return res.status(401).json({
                        error: "Unauthorized"
                    });
                }).catch(function(error) {
                    return res.status(401).json({
                        error: "Unauthorized"
                    });
                })
            }).catch(function(error) {
                return res.status(401).json({
                    error: "Reused Nonce"
                });
            });

        }
        else {
            console.log("No WSSE Header");
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
    }
}
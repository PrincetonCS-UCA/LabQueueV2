'use strict';

const passport = require('passport');
const getProp = require('../../../utils/getProp');

const errors = require('feathers-errors');

module.exports = function(app, models) {

    const wssePromise = require('./promises/wssePromise')(models);

    return {
        casBlock: function(options) {
            return function(req, res, next) {
                if (!req.isAuthenticated || !req.isAuthenticated()) {
                    throw new errors.NotAuthenticated(
                        'Requires CAS credentials');
                }
                next();
            }
        },
        casBounce: function(options) {
            if (typeof options == 'string') {
                options = {
                    redirectTo: options
                }
            }
            options = options || {};

            var url = options.redirectTo || '/login';
            var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

            return function(req, res, next) {
                if (!req.isAuthenticated || !req.isAuthenticated()) {
                    if (setReturnTo && req.session) {
                        req.session.returnTo = req.originalUrl || req.url;
                    }
                    return res.redirect(url);
                }
                next();
            }
        },
        isAuthenticated: function(options) {
            return function(req, res, next) {
                return wssePromise(req.headers).then(function(user) {
                    req.user = user;
                    next();
                }).catch(function(error) {
                    next(new errors.NotAuthenticated(
                        'Improper WSSE credentials'));
                })
            }
        }
    }
}
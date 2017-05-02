'use strict';

var assert = require('assert');
var should = require('should');

const async = require('async');

const db = require('../models');

const RequestUtils = require('./util/requestUtils');
const dbUtils = require('./util/dbUtils');
const service = "test";

const requestStatuses = require('../enums/requestStatuses');

const users = [{
    username: "test1",
    password: "password"
}, {
    username: "test2",
    password: "password2"
}];

describe('Loading Express', function() {

    var server;
    before(function(done) {
        console.log("Loading Express");
        server = require('../index');
        db.sequelize.sync({
            force: true
        }).then(function() {

            async.series([
                function(callback) {
                    dbUtils.generateKey(db, users[0].username,
                        users[0].password, service,
                        callback);
                },
                function(callback) {
                    dbUtils.generateKey(db, users[1].username,
                        users[1].password, service,
                        callback);
                },
                function(callback) {
                    dbUtils.createCASUser(db, users[0].username,
                        callback);
                },
                function(callback) {
                    dbUtils.createCASUser(db, users[1].username,
                        callback);
                }
            ], function() {
                done();
            });

        }).catch(function(error) {
            console.log(error);
        });
    });

    describe('Policies', function() {

        var requestUtils = [];
        before(function(done) {
            this.timeout(5000);

            requestUtils[0] = RequestUtils(users[0].username, users[0].password,
                service);
            requestUtils[1] = RequestUtils(users[1].username, users[1].password,
                service);
            var req = requestUtils[0].createRequest(server,
                '/api/v1/queue',
                'POST', {
                    name: "Test Queue",
                    description: "",
                    courses: ['126', '226', '217'],
                    rooms: ['121', '122']
                });

            req.end(function(error,
                response) {
                var res = response.body;
                console.log(res);
                done();
            });

        });
    });
})
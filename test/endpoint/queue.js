'use strict';

var assert = require('assert');
var should = require('should');

const db = require('../../models');
const username = 'dmliao';
const service = 'test';
const password =
    'a2d7b49fbb9caed00add4027a9411a90f187e038b96c255a0a131a0b45d1ae9a';

const RequestUtils = require('./util/requestUtils');
const dbUtils = require('./util/dbUtils');

describe('Loading Express', function() {

    var server;
    before(function(done) {
        var serverPromise = require('../../server');
        serverPromise.then(function(app) {
            server = app;
            db.sequelize.sync({
                force: true
            }).then(function() {
                console.log("synced to database");
                dbUtils.createCASUser(db, username, done);
            });
        })

    });
    afterEach(function(done) {
        done();
    });

    describe('Queue', function() {
        before(function(done) {
            this.timeout(5000);
            console.log(
                "Make sure you set the WSSE key properly!"
            );
            db.Queue.destroy({
                truncate: true
            }).then(function() {
                return db.Policy.destroy({
                    truncate: true
                });
            }).then(function() {
                dbUtils.generateKey(db, username, password, service,
                    done);
            }).catch(function(error) {
                console.log(error);
            });
        })
        describe('createQueue', function() {
            it('should create a queue', function(done) {
                var requestUtils = RequestUtils(username, password,
                    service);
                var req = requestUtils.createRequest(server,
                    '/api/v1/queue',
                    'POST', {
                        name: "Test Queue",
                        description: ""
                    });

                req.end(function(error,
                    response) {
                    var res = response.body;
                    should.not.exist(
                        error);
                    assert.equal(res.name, "Test Queue");
                    assert.equal(res.ownerId, "dmliao");
                    done();
                });
            });

            it('should create a second queue', function(
                done) {
                var requestUtils = RequestUtils(username, password,
                    service);
                var req = requestUtils.createRequest(server,
                    '/api/v1/queue',
                    'POST', {
                        name: "Test Queue 2",
                        description: ""
                    });

                req.end(function(error,
                    response) {
                    var res = response.body;
                    should.not.exist(
                        error);
                    assert.equal(res.name,
                        "Test Queue 2"
                    );
                    done();
                });
            });

            it('should not create a queue without a name', function(done) {
                var requestUtils = RequestUtils(username, password,
                    service);
                var req = requestUtils.createRequest(server,
                    '/api/v1/queue',
                    'POST', {});

                req.end(function(error,
                    response) {
                    should(response.statusCode)
                        .be.exactly(
                            400);
                    done();
                });
            });

            it('should not create queues with the same name',
                function(done) {
                    var requestUtils = RequestUtils(username, password,
                        service);
                    var req = requestUtils.createRequest(server,
                        '/api/v1/queue',
                        'POST', {
                            name: "Test Queue",
                            description: ""
                        });

                    req.end(function(error,
                        response) {
                        should(response.statusCode)
                            .be.exactly(
                                400);
                        done();
                    });
                });

            it('should automatically create a course for the queue',
                function(done) {

                    db.Queue.destroy({
                        truncate: true
                    }).then(function() {
                        var requestUtils = RequestUtils(
                            username, password,
                            service);
                        var req = requestUtils.createRequest(
                            server,
                            '/api/v1/queue',
                            'POST', {
                                name: "Test Queue With Course",
                                description: "",
                                courses: ['COS126']
                            });

                        req.end(function(error,
                            response) {
                            var res = response.body;
                            console.log(res);
                            should.not.exist(
                                error);
                        assert.equal(res.courses.length,
                                1);
                            done();
                        });
                    })

                })

            it('should allow multiple and existing courses for queue',
                function(done) {

                    db.Queue.destroy({
                        truncate: true
                    }).then(function() {
                        var requestUtils = RequestUtils(
                            username, password,
                            service);
                        var req = requestUtils.createRequest(
                            server,
                            '/api/v1/queue',
                            'POST', {
                                name: "Test Queue With Course 2",
                                description: "",
                                courses: ['COS126',
                                    'COS226', 'COS217'
                                ]
                            });

                        req.end(function(error,
                            response) {
                            var res = response.body;
                            console.log(res);
                            should.not.exist(
                                error);
                            assert.equal(res.courses.length,
                                3);
                            db.Course.count().then(
                                function(c) {
                                    assert.equal(c,
                                        3);
                                    done();
                                })
                        });
                    })

                })
        });
    });
})
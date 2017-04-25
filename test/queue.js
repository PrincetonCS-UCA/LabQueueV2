'use strict';

var assert = require('assert');
var request = require('supertest');
var should = require('should');
var wsse = require('../vendor/wsse');

const db = require('../models');
const username = 'dmliao';
const service = 'test';
const password = 'a2d7b49fbb9caed00add4027a9411a90f187e038b96c255a0a131a0b45d1ae9a';

function createRequest(server, endpoint, method) {
    var token = new wsse.UsernameToken({
        username: username + "+" + service,
        password: password
    });

    var wsseString = token.getWSSEHeader({
        nonceBase64: true
    });

    var req;
    switch (method) {
        case 'POST':
            req = request(server).post(endpoint);
            break;
        case 'GET':
            req = request(server).get(endpoint);
    }
    return req
        .set('Authorization', 'WSSE profile="UsernameToken"')
        .set('X-WSSE', wsseString)

}

function generateKey(done) {
    return db.WSSEKey.destroy({
        where: {
            username: username,
            service: service
        }

    }).then(function() {
        return db.WSSEKey.create({
            username: username,
            service: service,
            key: password
        })
    }).then(function() {
        done();
    })
}

function createCASUser(done) {
    db.User.destroy({
        truncate: true
    }).then(function() {
        return db.User.create({
            name: "Test User",
            casId: "dmliao",
            universityId: "dmliao"
        })
    }).then(function() {
        done()
    });
}

describe('Loading Express', function() {

    var server;
    beforeEach(function(done) {
        server = require('../index');
        createCASUser(done);
    });
    afterEach(function(done) {
        done();
    });

    describe('Auth', function() {
        before(function(done) {
            generateKey(done);
        })
    })

    describe('Queue', function() {
        before(function(done) {
            this.timeout(5000);
            console.log("Make sure you set the WSSE key properly!");
            db.sequelize.sync({
                force: false
            }).then(function() {
                console.log("Synced");
                return db.Queue.destroy({
                    truncate: true
                })
            }).then(function() {
                console.log("Destroyed all queues");
                return db.Policy.destroy({
                    truncate: true
                });
            }).then(function() {
                generateKey(done);
            }).catch(function(error) {
                console.log(error);
            });
        })
        describe('createQueue', function() {
            it('should create a queue', function(done) {
                var req = createRequest(server,
                    '/api/v1/queue',
                    'POST');

                req.end(function(error, response) {
                    var res = response.body;
                    should.not.exist(error);
                    assert.equal(res.name, "Test Queue");
                    done();
                });
            });

            it('should not create queues with the same name', function(done) {
                var req = createRequest(server,
                    '/api/v1/queue',
                    'POST');

                req.end(function(error, response) {
                    should(response.statusCode).be.exactly(
                        400);
                    done();
                });
            });
        });
    });
})
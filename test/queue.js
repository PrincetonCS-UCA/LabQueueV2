'use strict';

var assert = require('assert');
var request = require('request');
var should = require('should');
var wsse = require('../vendor/wsse');

const db = require('../models');
const username = 'dmliao';
const service = 'test';
const password = 'a2d7b49fbb9caed00add4027a9411a90f187e038b96c255a0a131a0b45d1ae9a';

function createRequestOptions(endpoint, method) {
    var token = new wsse.UsernameToken({
        username: username + "+" + service,
        password: password
    });

    var wsseString = token.getWSSEHeader({
        nonceBase64: true
    });
    var options = {
        url: endpoint,
        headers: {
            'Authorization': 'WSSE profile="UsernameToken"',
            'X-WSSE': wsseString
        },
        method: method
    };

    return options;
}

function generateKey(done) {
    db.sequelize.sync({
        force: false
    }).then(function() {
        return db.WSSEKey.destroy({
            where: {
                username: username,
                service: service
            }
        })
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

describe('Auth', function() {
    before(function(done) {
        this.timeout(5000);
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
            var opts = createRequestOptions(
                'http://localhost:3000/api/v1/queue',
                'POST');

            request(opts, function(error, response, body) {
                console.log(error);
                console.log(response);
                var res = JSON.parse(body);
                console.log(response);
                should.not.exist(error);
                assert.equal(res.name, "Test Queue");
                done();
            });
        });

        it('should not create queues with the same name', function(done) {
            var opts = createRequestOptions(
                'http://localhost:3000/api/v1/queue',
                'POST');

            request(opts, function(error, response, body) {
                console.log(response.statusCode);
                var res = JSON.parse(body);
                should(response.statusCode).be.exactly(400);
                done();
            });
        });
    });
});
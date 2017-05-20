'use strict';

const config = require('../../../config/config.json');
const request = require('superagent');
const wsse = require('../../../vendor/wsse');

module.exports = function(models) {
    function getStudentInfo(casId) {
        var endpoint = 'https://tigerbook.herokuapp.com/api/v1/undergraduates/' + casId;

        var username = config.tigerbook.username;
        var password = config.tigerbook.password;

        var token = wsse({
            username: username,
            password: password
        });

        var wsseString = token.getWSSEHeader({
            nonseBase64: true
        });

        var headers = {
            'Authorization': 'WSSE profile="UsernameToken"',
            'X-WSSE': wsseString
        };

        return new Promise(function(resolve, reject) {
            request.get(endpoint)
                .set(headers)
                .end(function(err, res) {
                    if (err) {
                        return reject(err);
                    }
                    if (res.ok) {
                        return resolve(JSON.parse(res.text));
                    }
                    return reject(new Error("Error retrieving data from Tigerbook"));
                });
        });

    }

    function getName(studentInfo) {
        return studentInfo.full_name;
    }

    return {
        getStudentInfo: getStudentInfo,
        getName: getName
    }
}
'use strict';

var config = require('../config/config.js');

var apiPrefix = config.apiPrefix;

exports.getUser = function() {
    var route = apiPrefix + 'me';
    return $.ajax({
        url: route,
        type: 'GET'
    });
}
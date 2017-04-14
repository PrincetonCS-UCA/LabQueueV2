'use strict';

var config = require('../config/config.js');

var apiPrefix = config.apiPrefix;

exports.getUser = function() {
    var route = apiPrefix + 'me';
    console.log(route);
    return $.ajax({
        url: route,
        type: 'GET'
    });
}
'use strict';

var config = require('../config/config.js');

var apiPrefix = config.apiPrefix;

exports.getQueue = function(queueSlug) {
    var route = apiPrefix + 'queue/' + queueSlug + '/current';
    return $.ajax({
        url: route,
        type: 'GET'
    });
}

exports.getQueueMeta = function(queueSlug) {
    var route = apiPrefix + 'queue/' + queueSlug;
    return $.ajax({
        url: route,
        type: 'GET'
    });
}
'use strict';

var config = require('../config/config.js');

var apiPrefix = config.apiPrefix;

exports.getQueue = function(queueId) {
    var route = apiPrefix + 'queue/' + queueId + '/current';
    return $.ajax({
        url: route,
        type: 'GET'
    });
}

exports.getQueueMeta = function(queueId) {
    var route = apiPrefix + 'queue/' + queueId;
    return $.ajax({
        url: route,
        type: 'GET'
    });
}

'use strict';

import React from 'react';
import {Route} from 'react-router';

var config = require('../config/config.js');

var apiPrefix = config.apiPrefix;

var Auth = require('./auth.jsx');
var Queues = require('../network/queues');
var QueueView = require('../views/queueView.jsx');

var onDisplayQueue = function(nextState) {
    var q = nextState.params.queue;

    Queues.getQueueMeta(q).then(function (queue) {
        console.log(queue);
    }).catch(function (error) {
        // 404
        console.log(error);
    })
}

exports.routes = (
    <Route path="/queue/:queue" component={Auth.requireAuthentication(QueueView)} onEnter={onDisplayQueue}/>
);
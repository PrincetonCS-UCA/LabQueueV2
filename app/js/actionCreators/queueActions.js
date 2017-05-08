import {
    browserHistory
}
from 'react-router';

var socket = io();
exports.socket = socket;

exports.postRequest = function(message) {
    return function(dispatch, getState) {
        var state = getState();
        socket.emit('REQUEST_POST', message);
        dispatch({
            type: 'REQUEST_POST',
            data: {
                // user: state.chat.username,
                message: message
            }
        });
    };
}

exports.pullQueueFromServer = function(queue) {
    return function(dispatch, getState) {
        var state = getState();
        dispatch({
            type: 'PULL_QUEUE_FROM_SERVER',
            data: {
                queue: queue
            }
        });
    }
}
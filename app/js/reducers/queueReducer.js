'use strict';

const defaultState = {
    name: '',
    requests: [] // {user: string, message: string}
};

module.exports = function(state = defaultState, action) {
    switch (action.type) {
        case 'REQUEST_POST':
            return Object.assign({}, state, {
                requests: [...state.requests, action.data]
            });

        case 'PULL_QUEUE_FROM_SERVER':
            return Object.assign({}, state, action.data.queue);

        default:
            return state;
    }
}
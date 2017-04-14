var mirrorKey = require('mirrorkey');

var requestStatuses = {
    "in_queue": null,
    "canceled": null,
    "was_helped": null
};

module.exports = mirrorKey(requestStatuses);
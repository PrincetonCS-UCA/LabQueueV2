var mirrorKey = require('mirrorkey');

var associations = {
    "add": null,
    "remove": null,
    "set": null
};

module.exports = mirrorKey(associations);
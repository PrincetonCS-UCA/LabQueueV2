const _ = require('lodash');

// retrieve a property from an object without case sensitivity
var getProp = function(obj, name) {
    var realName = _.findKey(obj, function(value, key) {
        return key.toLowerCase() === name.toLowerCase();
    });
    return obj[realName];
};

module.exports = getProp;
'use strict';

var fs = require('fs'),
    path = require('path');

// recursively walk modules path and callback for each file
var walk = function(modulesPath, deep, callback) {
    fs.readdirSync(modulesPath).forEach(function(file) {
        var newPath = path.join(modulesPath, file);
        var stat = fs.statSync(newPath);
        if (stat.isFile() && /(.*)\.(js|coffee)$/.test(file)) {
            callback(newPath);
        }
        else if (stat.isDirectory() && deep === true) {
            walk(newPath, excludeDir, callback);
        }
    });
};
module.exports = walk;
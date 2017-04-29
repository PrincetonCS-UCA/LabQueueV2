'use strict';

var auth = require('./middleware/auth');
module.exports = function(app, models, prefix) {

    var Controller = require('./controllers/courseController')(app, models);

}
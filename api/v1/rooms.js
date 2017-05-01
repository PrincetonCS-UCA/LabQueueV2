'use strict';

module.exports = function(app, models, prefix) {

    var auth = require('./middleware/auth')(app, models);
    var Controller = require('./controllers/roomController')(app, models);

}
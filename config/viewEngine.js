'use strict';

var path = require('path');
var cons = require('consolidate');

module.exports = function(app) {

    // assign the swig engine to .html files 
    app.engine('html', cons.nunjucks);

    // set .html as the default extension 
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, '..', '/app/views'));

}
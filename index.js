'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const Sequelize = require('sequelize');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var auth = require('./api/v1/middleware/auth');

var path = require('path');
// var favicon = require('serve-favicon');

var env = process.env.NODE_ENV || "development";

var viewConf = require('./config/viewEngine');
var passportConf = require('./config/passport');

const db = require('./models');

app.set('port', process.env.PORT || 3000);

// view engine setup
viewConf(app);

app.use(session({
    secret: 'super secret key',
    resave: false,
    saveUninitialized: true
}));

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
passportConf(app);

//This is the options object that will be passed to the api files
let apiOptions = {
    app: app,
    models: db
};

//Load the api versions
require('./api/v1')(apiOptions);

var socketOptions = {
    app: http,
    models: db
};

app.get('*', auth.casBounce(), function(req, res) {
    res.render('index', {
        user: JSON.stringify(req.user)
    });
});

//Load the socket file
require('./sockets')(socketOptions);

//sync all sequelize models
db.sequelize.sync({
    force: false
}).then(function() {

    // Test the connection to the database
    if (env === "development") {
        db.sequelize
            .authenticate()
            .then(function(err) {
                console.log(
                    'Connection has been established successfully.'
                );
            })
            .catch(function(err) {
                console.log('Unable to connect to the database:',
                    err);
            });
    }

    start();
});

function start() {
    http.listen(app.get('port'), function() {
        console.log(
            'Express server listening on port %d in %s mode',
            app.get('port'), app.get('env'));
    });
}

module.exports = app;
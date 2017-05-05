'use strict';
const walk = require('../utils/walk');
const setupParams = require('./v1/middleware/params');

const errors = require('feathers-errors');
const prefix = '/api/v1/';

module.exports = function(options) {

  //This is the express app object
  let app = options.app;
  //This is the map of all of your sequelize models
  let models = options.models;

  /**
   * All of the api routes go here.
   */

  setupParams(app, models);

  var routesPath = __dirname + '/v1';
  walk(routesPath, false, function(path) {
    require(path)(app, models, prefix);
  });

  // TODO: fix this???
  app.route(prefix + 'error')
    .get(function(req, res, next) {
      return Promise.resolve("e").then(function(e) {
        next(new errors.NotImplemented(e));
      })

    })

  // Assume 404 since no middleware responded
  app.use(prefix, function(req, res) {
    throw new errors.NotFound();
  });

};
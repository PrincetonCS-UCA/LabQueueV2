"use strict";

const requestStatuses = require('../enums/requestStatuses');

module.exports = function(sequelize, DataTypes) {
  var Request = sequelize.define("Request", {
    message: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: requestStatuses.in_queue
    }
  }, {
    classMethods: {
      associate: function(models) {
        Request.belongsTo(models.Queue);
        Request.belongsTo(models.User, {
          as: "author"
        });
        Request.belongsTo(models.User, {
          as: "helper"
        });
        Request.belongsTo(models.Course);
        Request.belongsTo(models.Room);
      }
    }
  });

  return Request;
};
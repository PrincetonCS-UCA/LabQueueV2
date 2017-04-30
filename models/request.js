"use strict";

const requestStatuses = require('../enums/requestStatuses');

module.exports = function(sequelize, DataTypes) {
  var Request = sequelize.define("Request", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    message: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: requestStatuses.in_queue
    }
  }, {
    classMethods: {
      associate: function(models) {
        Request.belongsTo(models.Queue, {
          as: "queue"
        });
        Request.belongsTo(models.User, {
          as: "author"
        });
        Request.belongsTo(models.User, {
          as: "helper"
        });
        Request.belongsTo(models.Course, {
          as: "course"
        });
        Request.belongsTo(models.Room, {
          as: "room"
        });
      }
    }
  });

  return Request;
};

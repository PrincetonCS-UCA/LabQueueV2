"use strict";

const getArraysOfIds = require('../utils/getArraysOfIds');

module.exports = function(sequelize, DataTypes) {
  var Queue = sequelize.define("queue", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: DataTypes.STRING,
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Queue.belongsTo(models.User, {
          as: "owner"
        });
        Queue.belongsToMany(models.Course, {
          through: "queueCourses",
          foreignKey: 'queueId'
        });
        Queue.belongsToMany(models.Room, {
          through: "queueRooms",
          foreignKey: 'queueId'
        });
      }
    },
    instanceMethods: {
      toJSON: function() {
        var values = this.get();
        // Do your magic here 

        if (values.courses) {
          values.courses = getArraysOfIds(values.courses);
        }
        if (values.rooms) {
          values.rooms = getArraysOfIds(values.rooms);
        }
        return values;
      }
    }
  });

  return Queue;
};
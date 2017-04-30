"use strict";

var convertToSlug = require('../utils/convertSlug');

module.exports = function(sequelize, DataTypes) {
  var Queue = sequelize.define("queue", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      set: function(val) {
        // has to set itself first...
        this.setDataValue('name', val);

        val = val.toLowerCase().trim();
        this.setDataValue('id', convertToSlug(val));
      }
    },
    description: DataTypes.STRING,
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Queue.belongsTo(models.User, {
          as: "owner"
        });
        Queue.belongsToMany(models.Course, {
          through: "QueueCourses",
          foreignKey: 'queueId'
        });
        Queue.belongsToMany(models.Room, {
          through: "QueueRooms",
          foreignKey: 'queueId'
        });
      }
    }
  });

  return Queue;
};

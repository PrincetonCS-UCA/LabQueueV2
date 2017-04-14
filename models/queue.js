"use strict";

var convertToSlug = require('../utils/convertSlug');

module.exports = function(sequelize, DataTypes) {
  var Queue = sequelize.define("Queue", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      set: function(val) {
        // has to set itself first...
        this.setDataValue('name', val);

        val = val.toLowerCase().trim();
        this.setDataValue('slug', convertToSlug(val));
      }
    },
    description: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Queue.belongsTo(models.User, {
          as: "owner"
        });
        Queue.belongsToMany(models.Course, {
          through: "QueueCourses"
        });
        Queue.belongsToMany(models.Room, {
          through: "QueueRooms"
        });
      }
    }
  });

  return Queue;
};
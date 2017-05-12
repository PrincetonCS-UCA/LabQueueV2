"use strict";

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
    }
  });

  return Queue;
};
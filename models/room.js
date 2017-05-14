"use strict";

module.exports = function(sequelize, DataTypes) {
  var Room = sequelize.define("room", {
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      validate: {
        isAlphanumeric: true
      }
    },
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Room.belongsToMany(models.Queue, {
          through: "queueRooms",
          foreignKey: "roomId"
        });

      }
    }
  });

  return Room;
};
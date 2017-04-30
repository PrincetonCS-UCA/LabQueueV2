"use strict";

module.exports = function(sequelize, DataTypes) {
  var Room = sequelize.define("Room", {
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Room.belongsToMany(models.Queue, {
          through: "QueueRooms"
        });

      }
    }
  });

  return Room;
};

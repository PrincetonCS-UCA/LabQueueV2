"use strict";

module.exports = function(sequelize, DataTypes) {
  var WSSEKey = sequelize.define("WSSEKey", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'usernameService'
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    service: {
      type: DataTypes.STRING,
      defaultValue: "generic",
      allowNull: false,
      unique: 'usernameService'
    }
  }, {
    classMethods: {
      associate: function(models) {}
    }
  });

  return WSSEKey;
};
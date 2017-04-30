"use strict";

module.exports = function(sequelize, DataTypes) {
  var WSSEEvent = sequelize.define("WSSEEvent", {
    nonce: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {}
    }
  });

  return WSSEEvent;
};

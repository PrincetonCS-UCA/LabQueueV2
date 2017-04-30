"use strict";

module.exports = function(sequelize, DataTypes) {
  var UserPolicy = sequelize.define("UserPolicy", {

  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return UserPolicy;
};

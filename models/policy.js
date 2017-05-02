"use strict";

var convertToSlug = require('../utils/convertSlug');

// as roles or permissions. Should we name it that, then?
module.exports = function(sequelize, DataTypes) {
  var Policy = sequelize.define("policy", {
    role: DataTypes.STRING, // as an enum?
    rules: {
      type: DataTypes.STRING, // as JSON
      defaultValue: "[]"
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: ""
    }
  }, {
    classMethods: {
      associate: function(models) {
        Policy.belongsTo(models.Queue, {
          as: "queue",
          onDelete: 'CASCADE'
        });
        Policy.belongsToMany(models.User, {
          through: models.UserPolicy,
          foreignKey: 'policyId'
        });
      }
    }
  });

  return Policy;
};
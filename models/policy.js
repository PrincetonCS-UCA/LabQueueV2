"use strict";

// as roles or permissions. Should we name it that, then?
module.exports = function(sequelize, DataTypes) {
  var Policy = sequelize.define("Policy", {
    role: DataTypes.STRING // as an enum?
  }, {
    classMethods: {
      associate: function(models) {
        Policy.belongsTo(models.Queue, {
          as: "queue"
        });
        Policy.belongsToMany(models.User, {
          through: 'UserPolicies'
        });
      }
    }
  });

  return Policy;
};

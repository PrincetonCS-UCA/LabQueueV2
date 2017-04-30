"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    universityId: DataTypes.STRING,
    casId: {
      type: DataTypes.STRING,
      unique: true,
      set: function(val) {
        // has to set itself first...
        this.setDataValue('casId', val);
        this.setDataValue('id', val);
      }
    },
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.belongsToMany(models.Policy, {
          through: models.UserPolicy,
          foreignKey: 'userId'
        });
      }
    }
  });

  return User;
};

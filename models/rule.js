"use strict";

// as roles or permissions. Should we name it that, then?
module.exports = function(sequelize, DataTypes) {
  var Rule = sequelize.define("Rule", {

  }, {
    classMethods: {
      associate: function(models) {
        Rule.belongsTo(models.Policy);
        Rule.belongsToMany(models.Room, {
          through: "RuleRooms"
        });
        Rule.belongsToMany(models.Course, {
          through: "RuleCourses"
        });
      }
    }
  });

  return Rule;
};
"use strict";

// TODO: set id onCreate. 
// http://stackoverflow.com/questions/31427566/sequelize-create-model-with-beforecreate-hook
module.exports = function(sequelize, DataTypes) {
  var Course = sequelize.define("Course", {
    name: DataTypes.STRING,
    term: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Course.belongsToMany(models.Queue, {
          through: "QueueCourses"
        });
        Course.belongsToMany(models.Rule, {
          through: "RuleCourses"
        });
      }
    }
  });

  return Course;
};
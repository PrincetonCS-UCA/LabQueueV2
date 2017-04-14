"use strict";

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
      }
    }
  });

  return Course;
};
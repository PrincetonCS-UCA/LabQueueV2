"use strict";

var convertToSlug = require('../utils/convertSlug');

// TODO: set id onCreate. 
// http://stackoverflow.com/questions/31427566/sequelize-create-model-with-beforecreate-hook

function setCourseId(name, term) {
  return convertToSlug(name + '-' + term);
}

module.exports = function(sequelize, DataTypes) {
  var Course = sequelize.define("course", {
    id: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      validate: {
        isAlphanumeric: true
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Course.belongsToMany(models.Queue, {
          through: "queueCourses",
          foreignKey: "courseId"
        });

      }
    }
  });

  return Course;
};
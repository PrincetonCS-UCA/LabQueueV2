"use strict";

const requestStatuses = require('../enums/requestStatuses');

module.exports = function(sequelize, DataTypes) {
  var Request = sequelize.define("request", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    message: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: requestStatuses.in_queue
    }
  }, {
    classMethods: {
      associate: function(models) {
        Request.belongsTo(models.Queue, {
          as: "queue"
        });
        Request.belongsTo(models.User, {
          as: "author",
          onDelete: "NO ACTION"
        });
        Request.belongsTo(models.User, {
          as: "helper",
          onDelete: "NO ACTION"
        });
        Request.belongsTo(models.Course, {
          as: "course",
          onDelete: "NO ACTION"
        });
        Request.belongsTo(models.Room, {
          as: "room",
          onDelete: "NO ACTION"
        });
      }
    },
    indexes: [{
      name: 'request_queue_index',
      method: 'BTREE',
      fields: ['queueId', {
        attribute: 'createdAt',
        order: 'DESC'
      }]
    }, {
      name: 'request_course_index',
      method: 'BTREE',
      fields: ['courseId', {
        attribute: 'createdAt',
        order: 'DESC'
      }]
    }, {
      name: 'request_author_index',
      method: 'BTREE',
      fields: ['authorId', {
        attribute: 'createdAt',
        order: 'DESC'
      }]
    }, {
      name: 'request_helper_index',
      method: 'BTREE',
      fields: ['helperId', {
        attribute: 'createdAt',
        order: 'DESC'
      }]
    }]
  });

  return Request;
};
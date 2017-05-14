'use strict';

const Promise = require('bluebird');

module.exports = function(models) {

    function createOrFindCourse(courseId) {
        return models.Course.findCreateFind({
            where: {
                id: courseId
            }
        }).spread(function(dbCourse, created) {
            return Promise.resolve(dbCourse);
        });
    }

    function bulkCreateCourses(courses) {
        return Promise.map(courses, function(course) {
            return createOrFindCourse(course);
        });
    }

    function updateCourse(courseId, courseObj) {
        return createOrFindCourse(courseId).then(function(course) {
            return course.update(courseObj);
        });
    }

    function deleteCourse(courseId) {
        return models.Course.destroy({
            where: {
                id: courseId
            }
        })
    }

    return {
        createOrFindCourse: createOrFindCourse,
        bulkCreateCourses: bulkCreateCourses,
        updateCourse: updateCourse,
        deleteCourse: deleteCourse
    };

}
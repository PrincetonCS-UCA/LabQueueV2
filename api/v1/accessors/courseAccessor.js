'use strict';

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

    return {
        createOrFindCourse: createOrFindCourse,
        bulkCreateCourses: bulkCreateCourses
    };

}
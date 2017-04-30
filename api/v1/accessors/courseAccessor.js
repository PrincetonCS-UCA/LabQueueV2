'use strict';

module.exports = function(models) {

    function createCourse(courseObj) {
        return models.Course.create(courseObj);
    }

    function createOrFindCourse(courseId) {
        return models.Course.findOne({
            where: {
                id: courseId
            }
        }).then(function(dbCourse) {
            if (!dbCourse) {
                return createCourse({
                    id: courseId
                });
            }
            return dbCourse.save();
        });
    }

    return {
        createCourse: createCourse,
        createOrFindCourse: createOrFindCourse
    };

}

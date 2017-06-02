const _ = require('lodash');
const convertToArray = require('../../../../utils/convertToArray');

const Validator = require('jsonschema').Validator;
var v = new Validator();

var ruleSchema = {
    'type': 'object',
    'properties': {
        'courses': {
            'type': ['string', 'array'],
            'items': {
                'type': 'string'
            }
        },
        'rooms': {
            'type': ['string', 'array'],
            'items': {
                'type': 'string'
            }
        }
    }
}

// UTILS
//////////

function fitsRule(request, rule) {
    // check if the criteria fits into the rule

    if (!v.validate(rule, ruleSchema).valid) {
        return false;
    }

    var requestCourse = request.courseId;
    var requestRoom = request.roomId;

    var ruleCourses = convertToArray(rule.courses);
    var ruleRooms = convertToArray(rule.rooms);

    var fitsCourse = false;
    var fitsRoom = false;

    if (requestCourse) {
        fitsCourse = _.findIndex(ruleCourses, function(o) {
            return o.toString() === requestCourse.toString();
        }) !== -1;
    }
    else {
        fitsCourse = true; // if the request has no course, it's free game
    }

    if (requestRoom) {
        fitsRoom = _.findIndex(ruleRooms, function(o) {
            return o.toString() === requestRoom.toString();
        }) !== -1;
    }
    else {
        fitsRoom = true;
    }

    return fitsCourse && fitsRoom;

}

function fitsRulesList(request, rules) {
    for (var i = 0; i < rules.length; i++) {
        if (fitsRule(request, rules[i])) {
            return true;
        }
    }
    return false;
}

function sortRules(rule1, rule2) {

    if (rule1.courses.length > rule2.courses.length) {
        return 1;
    }
    if (rule1.courses.length < rule2.courses.length) {
        return -1;
    }

    var sortedCourses1 = rule1.courses.sort();
    var sortedCourses2 = rule2.courses.sort();

    for (var i = 0; i < rule1.courses.length; i++) {
        if (sortedCourses1[i] > sortedCourses2[i]) {
            return 1;
        }
        else if (sortedCourses1[i] < sortedCourses2[i]) {
            return -1;
        }
    }

    if (rule1.rooms.length > rule2.rooms.length) {
        return 1;
    }
    if (rule1.rooms.length < rule2.rooms.length) {
        return -1;
    }

    var sortedRooms1 = rule1.rooms.sort();
    var sortedRooms2 = rule2.rooms.sort();

    for (var i = 0; i < rule1.rooms.length; i++) {
        if (sortedRooms1[i] > sortedRooms2[i]) {
            return 1;
        }
        else if (sortedRooms1[i] < sortedRooms2[i]) {
            return -1;
        }
    }

    return 0;
}

function isEqual(rule1, rule2) {
    return sortRules(rule1, rule2) === 0;
}

module.exports = {
    ruleSchema: ruleSchema,
    fitsRule: fitsRule,
    fitsRulesList: fitsRulesList,

    sortRules: sortRules,
    isEqual: isEqual
};
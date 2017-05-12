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

    return _.findIndex(ruleCourses, requestCourse) !== -1 &&
        _.findIndex(ruleRooms, requestRoom) !== -1;

}

function fitsRulesList(request, rules) {
    for (var i = 0; i < rules.length; i++) {
        if (fitsRule(request, rules[i])) {
            return true;
        }
    }
    return false;
}

module.exports = {
    ruleSchema: ruleSchema,
    fitsRule: fitsRule,
    fitsRulesList: fitsRulesList
};
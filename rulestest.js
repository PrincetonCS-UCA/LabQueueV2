const Validator = require('jsonschema').Validator;
var v = new Validator();
const _ = require('lodash');

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

function convertToArray(input) {
    if (Array.isArray(input)) {
        return input;
    }
    return [input];
}

function fitsRule(criteria, rule) {
    // check if the criteria fits into the rule

    if (!v.validate(rule, ruleSchema).valid) {
        return false;
    }

    var criteriaCourses = convertToArray(criteria.courses);
    var criteriaRooms = convertToArray(criteria.rooms);

    var ruleCourses = convertToArray(rule.courses);
    var ruleRooms = convertToArray(rule.rooms);

    return _.difference(criteriaCourses, ruleCourses).length === 0 &&
        _.difference(criteriaRooms, ruleRooms).length === 0;

}

var rule1 = {
    courses: ['217', '226', '126'],
    rooms: ['121', '122']
};

var rule2 = {
    courses: ['226'],
    rooms: ['121', '122']
};

var criteria = {
    courses: '217',
    rooms: '121'
};

console.log(fitsRule(criteria, rule1));
console.log(fitsRule(criteria, rule2));

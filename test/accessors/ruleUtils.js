var assert = require('assert');
var should = require('should');

var faker = require('faker');
var _ = require('lodash');

var ruleUtils = require('../../api/v1/accessors/utils/rules');

function generateRule(numCourses, numRooms) {
    var rule = {
        courses: [],
        rooms: []
    };

    for (var i = 0; i < numCourses; i++) {
        rule.courses.push(faker.random.word());
    }

    for (var i = 0; i < numRooms; i++) {
        rule.rooms.push(faker.random.word());
    }

    return rule;
}

describe("Testing Rule Utils", function() {

    it("should sort rules", function() {
        var rules = [];
        for (var i = 0; i < 5; i++) {
            rules.push(generateRule(5, 5));
        }

        var rules2 = _.shuffle(rules);

        assert.equal(_.isEqual(rules.sort(ruleUtils.sortRules), rules2.sort(
            ruleUtils.sortRules)), true);

    });

    it("should check that rules with the same courses and rooms are equal", function() {
        rule = generateRule(5, 5);

        var rule2 = _.extend({}, rule);
        rule2.courses = _.shuffle(rule.courses);
        rule2.rooms = _.shuffle(rule.rooms);

        assert.equal(_.isEqual(rule2, rule), false);
        assert.equal(ruleUtils.sortRules(rule2, rule), 0);
    })

})
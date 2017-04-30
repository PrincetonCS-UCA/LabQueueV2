'use strict';

var validate = require('jsonschema').validate;

module.exports = function(inArray) {
	var schema = {
		type: 'array',
		items: {
			type: 'object',
			properties: {
				id: {
					type: ['string', 'number']
				}
			},
			required: ['id']
		}
	}

	if (!validate(inArray, schema).valid) {
		return null;
	}

	var outArray = [];
	for (var i = 0; i < inArray.length; i++) {
		outArray.push(inArray[i].id);
	}

	return outArray;
}

'use strict';

module.exports = function(err, filter, space) {
	var plainObject = {};
	Object.getOwnPropertyNames(err).forEach(function(key) {
		plainObject[key] = err[key];
	});
	return JSON.stringify(plainObject, filter, space);
};

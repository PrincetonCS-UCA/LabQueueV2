"use strict";

module.exports = function(sequelize, DataTypes) {
	var UserPolicy = sequelize.define("userPolicy", {

	}, {
		classMethods: {
			associate: function(models) {

			}
		}
	});

	return UserPolicy;
};

var request = require('supertest');
var wsse = require('../../vendor/wsse');

module.exports = function(username, password, service) {

	return {
		createRequest: function(server, endpoint, method, data) {
			var token = new wsse.UsernameToken({
				username: username + "+" + service,
				password: password
			});

			var wsseString = token.getWSSEHeader({
				nonceBase64: true
			});

			var req;
			switch (method) {
				case 'POST':
					req = request(server).post(endpoint);
					break;
				case 'GET':
					req = request(server).get(endpoint);
			}
			if (data) {
				req = req.send(data);
			}
			return req
				.set('Authorization', 'WSSE profile="UsernameToken"')
				.set('X-WSSE', wsseString)
		}

	}

}

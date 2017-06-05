var wsse = require('../../../vendor/wsse');
var config = require('../../../config/config.json');
var Cookies = require('cookies-js');

var wsseService = "webqueue";
var apiPrefix = config.apiPrefix;

function sendRequest(route, method, data, wsse) {

    var ops = {
        url: route,
        type: method
    };
    if (data) {
        ops.data = data;
    }
    if (wsse) {
        ops.headers = {
            'Authorization': 'WSSE profile="UsernameToken"',
            'X-WSSE': wsse
        }
    }
    return $.ajax(ops);

}

function setWSSEHeader(username, service, wsseKey) {
    var token = wsse({
        username: username + "+" + service,
        password: wsseKey
    });

    var wsseString = token.getWSSEHeader({
        nonceBase64: true
    });

    return wsseString;
}

// calls the wsse endpoint to obtain a wsseString, that is then saved as a cookie
function setWSSECookie(getKeyURL, cookie) {
    return $.ajax({
        url: getKeyURL,
        type: "GET"
    }).then(function(result) {
        // Setting a cookie value
        return new Promise(function(resolve, reject) {
            Cookies.set(cookie, result);
            resolve(result);
        })
    }).catch(function(error) {
        console.log(error);
        return Promise.reject(error);
    })
}

function retrieveWSSEKey(getKeyURL, cookie) {
    var wsseKey = Cookies.get(cookie);

    if (!wsseKey) {
        return setWSSECookie(getKeyURL, cookie).then(function(result) {
            wsseKey = Cookies.get(cookie);
            return Promise.resolve(wsseKey);
        }).catch(function(error) {
            console.log(error);
            // window.location.href = '/login';
        });
    }
    return Promise.resolve(wsseKey);
}

function authenticateInternal(route, getKeyURL, cookie, method, data) {
    var w = '';
    console.log("Authenticating");
    return retrieveWSSEKey(getKeyURL, cookie).then(function(wsseKey) {
        console.log("Retrieved cookie");
        w = wsseKey;
        return sendRequest(apiPrefix + 'me', 'GET');
    }).then(function(me) {
        console.log(me);
        var wsse = setWSSEHeader(me.casId, wsseService, w);
        console.log(wsse);
        console.log(w);
        return sendRequest(route, method, data, wsse);
    }).then(function(response) {
        return Promise.resolve(response);
    }).catch(function(err) {
        console.log("We reached the error");
        console.log(err);
        Cookies.expire(cookie);
        return Promise.reject(err);
    })

}

function sendAuthenticatedRequest(route, method, data) {
    method = method || 'GET';

    var getKeyURL = apiPrefix + "wsse/" + wsseService;
    var cookie = 'local-wsse';

    return authenticateInternal(route, getKeyURL, cookie, method, data);

}

module.exports = {
    sendAuthenticatedRequest: sendAuthenticatedRequest,
    sendRequest: sendRequest
}
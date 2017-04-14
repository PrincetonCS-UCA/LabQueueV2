'use strict';

import React from 'react';

import {Provider, connect} from 'react-redux';

var Users = require('../network/users');
var config = require('../config/config.js');

var apiPrefix = config.apiPrefix;

var isAuthenticated = (nextState, replace) => {
    if (!window.user) {
        Users.getUser().then(function(user) {
            console.log(user);
            window.user = user;
        }).catch(function(e) {
            console.log(e);
            window.location.replace("/login");
        });
    }
};



exports.isAuthenticated = isAuthenticated;
exports.requireAuthentication = function (Component) {
    class AuthenticatedComponent extends React.Component {

        componentWillMount () {
            this.checkAuth();
        }

        componentWillReceiveProps (nextProps) {
            this.checkAuth();
        }

        checkAuth () {
            isAuthenticated();
        }

        render () {
            return (
                <div>
                    <Component {...this.props}/>
                </div>
            )

        }
    }

    const mapStateToProps = (state) => ({
        
    });

    return connect(mapStateToProps)(AuthenticatedComponent);

}
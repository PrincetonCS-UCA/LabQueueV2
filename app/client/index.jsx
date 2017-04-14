import 'babel-polyfill';
import React from 'react';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {render} from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

const queueReducer = require('./reducers/queueReducer.js');

const queuesController = require('./routes/queues');

var socket = io.connect('');

var reducer = combineReducers({
  queue: queueReducer
});

var store = createStore(
  reducer,
  applyMiddleware(thunk)
);


var mapStateToProps = (state) => {
  return {
    data: state.data,
    message: state.message
  }
}


var Index = connect(
  mapStateToProps
)(React.createClass({
  render: function() {
    return (
      <div
        className={'container'}
        >
        <h1>Lab Queue Prototype</h1>
        <div>{this.props.message}</div>
        <div
          className={'large-flex'}
          >
          {this.props.children}
        </div>
      </div>
    );
  }
}));

var router = (
  <Router history={browserHistory}>
    <Route path="/" component={Index}>
      <IndexRoute/>
      {queuesController.routes}
    </Route>
  </Router>
);

render(
  <Provider store={store}>{router}</Provider>,
  document.getElementById('app')
);

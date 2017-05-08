import React from 'react';
import {connect} from 'react-redux';

const actions = require('../actionCreators/queueActions');
const Queues = require('../network/queues');

var QueueView = React.createClass({
    propTypes: {
        queue: React.PropTypes.shape({
            name: React.PropTypes.string.isRequired,
            requests: React.PropTypes.array
        }).isRequired,
        postRequest: React.PropTypes.func,
        sendChange: React.PropTypes.func,
        pullQueueFromServer: React.PropTypes.func
    },
    getInitialState: function () {
        return {
            message: ''
        };
    },
    componentDidMount: function () {
        var self = this;
        Queues.getQueueMeta(this.props.params.queue).then(function (queue) {
            console.log(queue);
            self.props.pullQueueFromServer(queue);
        }).catch(function (error) {
            // 404
            console.log(error);
        });
        document.title = 'Queue Name: ' + this.props.queue.name;
    },
    componentDidUpdate: function(prevProps) {
        // nothing for
        console.log(this.props);
    },
    render: function () {
        var requests = this.props.queue.requests.map(function (elem, i) {
            var userStyle = {
                marginRight: '2px'
            };
            userStyle.textDecoration = elem.hidden ? 'line-through' : 'none';
            return (
                <div
                    key={i}
                    style={{
                        padding: '2px'
                    }}
                    >
                    <i>{elem.message}</i>
                </div>
            );
        });
        
        return (
            <div
                className={'large-flex'}
                style={{
                    flexDirection: 'column'
                }}
                >
                <h2>Room: {this.props.queue.name}</h2>
                <div
                    className={'large-flex'}
                    >
                    <div
                        className={'large-flex'}
                        style={{
                            flexDirection: 'column'
                        }}
                        id={'chat-window'}
                        >
                        <div
                            className={'bordered'}
                            style={{
                                overflowY: 'auto',
                                flex: '1',
                                wordBreak: 'break-word'
                            }}
                            id={'history'}
                            >
                            {requests}
                        </div>
                        <div
                            className={'small-flex'}
                            >
                            <input
                                value={this.state.message}
                                onKeyPress={this.handleKeyPress}
                                onChange={this.handleChange}
                                style={{
                                    flex: '1'
                                }}
                                autoFocus
                                />
                            <span
                                className={'btn'}
                                onClick={this.handleClick}
                                >Send</span>
                        </div>
                    </div>
                    
                </div>
            </div>
        );
    },
    handleKeyPress: function (e) {
        if (e.key === 'Enter' && this.state.message) {
            this.postRequest();
        }
    },
    handleClick: function () {
        if (this.state.message) {
            this.postRequest();
        }
    },
    handleChange: function (e) {
        this.setState({
            message: e.target.value
        });
        // this.props.sendChange(e.target.value);
    },

    postRequest: function () {
        this.props.postRequest(this.state.message);
        this.setState({
            message: ''
        });
    }
    
});

var mapStateToProps = state => {
    return {
        queue: state.queue
    };
};

var mapDispatchToProps = dispatch => {
    return {
        postRequest: function (message) {
            dispatch(actions.postRequest(message));
        },
        pullQueueFromServer: function(queue) {
            dispatch(actions.pullQueueFromServer(queue));
        }
    };
};

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(QueueView);

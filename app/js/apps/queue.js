var ajax = require('../controllers/ajax.js');
var apiPrefix = require('../../../config/config.json').apiPrefix;
var List = require('list.js');

var policyTypes = require('../../../enums/policyTypes');
var ruleUtils = require('../../../api/v1/accessors/utils/rules');

class QueueApp {
    constructor(queueId) {
        this.id = queueId;
        this.queueList = new List('queue-list', {
            valueNames: ['number', 'name', 'netId', 'courseId', 'roomId', 'message', {
                data: ['id']
            }],
            item: '<tr>' +
                '<td class="number"></td>' +
                '<td class="name"></td>' +
                '<td class="netId"></td>' +
                '<td class="courseId"></td>' +
                '<td class="roomId"></td>' +
                '<td class="message"></td>' +
                '<td class="action"></td>' +
                '</tr>'
        });
        this.refresh();
    }

    refresh() {
        var self = this;
        // fetch the queue's active requests from API, then update the view
        this.queueList.clear();
        this.getActiveRequests().then(function(requests) {
            console.log(requests);
            for (var i = 0; i < requests.length; i++) {
                var request = requests[i];
                self.addRequest(request);
            }
        });
    }

    addRequest(request) {
        var listItem = this.queueList.add({
            id: request.id,
            number: this.queueList.size() + 1,
            name: request.author.name,
            netId: request.authorId,
            message: request.message,
            courseId: request.courseId,
            roomId: request.roomId
        });

        this.setPermissionsForRequest(request.id);
    }

    setPermissionsForRequest(requestId) {
        var self = this;
        var canCancel = false;
        var canClose = false;
        var request = this.queueList.get('id', requestId)[0];

        if (request.netId === window.user.casId) {
            canCancel = true;
        }

        if (this.canEditRequest(request)) {
            canClose = true;
            canCancel = true;
        }

        var element = $(request.elm).find('.action');
        console.log(element);
        console.log(canClose);
        console.log(canCancel);
        if (canClose) {
            var closeButton = $('<a data-id="' + requestId + '">');
            closeButton.addClass('help-request btn btn-success');
            closeButton.html('<i class="glyphicon glyphicon-ok"></i>');
            element.append(closeButton);
            closeButton.click(function(event) {
                var requestId = $(this).data('id');
                return ajax.sendAuthenticatedRequest(apiPrefix + 'queue/' + self.id + '/requests/' + requestId +
                    '/complete', 'POST').then(function(response) {
                    self.queueList.remove("id", requestId);

                }).catch(function(error) {
                    // create a modal with the error.
                })
            });
        }
        if (canCancel) {
            var cancelButton = $('<a data-id="' + requestId + '">');
            cancelButton.addClass('help-request btn btn-danger');
            cancelButton.html('<i class="glyphicon glyphicon-remove"></i>');
            element.append(cancelButton);
            cancelButton.click(function(event) {
                var requestId = $(this).data('id');
                return ajax.sendAuthenticatedRequest(apiPrefix + 'queue/' + self.id + '/requests/' + requestId +
                    '/cancel', 'POST').then(function(response) {
                    self.queueList.remove("id", requestId);

                }).catch(function(error) {
                    // create a modal with the error.
                })
            });
        }
    }

    isTA() {
        if (!window.policies) {
            return false;
        }
        for (var i = 0; i < window.policies.length; i++) {
            if (window.policies[i].role === policyTypes.ta) {
                return true;
            }
        }
        return false;
    }

    canEditRequest(request) {
        for (var i = 0; i < window.policies.length; i++) {
            if (ruleUtils.fitsRulesList(request, window.policies[i].rules)) {
                return true;
            }
        }
        return false;
    }

    // controller functions
    getActiveRequests() {
        return ajax.sendAuthenticatedRequest(apiPrefix + 'queue/' + this.id + '/active').then(function(response) {
            return Promise.resolve(response);
        }).catch(function(error) {
            return Promise.reject(error);
        })
    }
}

module.exports = QueueApp;
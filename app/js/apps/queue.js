class QueueApp {
    constructor(queueId) {
        this.id = queueId;
    }

    refresh() {
        // fetch the queue's active requests from API, then update the view
    }
}

module.exports = QueueApp;
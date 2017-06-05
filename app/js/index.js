var QueueApp = require('./apps/queue');

console.log(window.queue);
if (window.queue) {
    window.queueApp = new QueueApp(window.queue.id);
}
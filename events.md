# Events Emitted by Server

`queue_requests_updated` - general catch-all for when a request is changed on a queue. Gives the following data:
    
    {
        type: 'queue_requests_updated',
        queue: queueId
    }

`request` - new request posted onto a queue

    {
        type: 'request',
        queue: queueId,
        request: {
            message: Message
            author: Author
            createdAt: Date
            id: requestId
        }
    }

`request_completed` - request has been completed

    {
        type: 'request_completed',
        queue: queueId
        requestId: requestId
    }

`request_canceled` - see above, except for canceled requests


# Workflow

    User logs onto queue, queue loads
    User posts a request, request and queue_requests_updated events fired
    Everyone who is logged on currently listens to the event, and refreshes the queue

When a TA completes a request:

    TA completes request, request_completed event is fired
    Everyone logged on refreshes queue upon receiving a queue_requests_updated event.
    Person who filed request listens to request_completed, and upon getting that event, is notified that the TA is coming to help them.

# THIS IS OUTDATED AND HAS NOT BEEN UPDATED PROPERLY.

Please see `api.md` and `frontend.md` for better design notes!

Repo -> Accessor or Modifier

Policies will eventually also be backed by courses and rooms, so we will probably have to name them.

* Authentication:
    - every time you open the app / browser, need to set up a session by going to /login before you have the user (even if cookies exist)
        - If CAS is still active, then going to /login automatically gives you the session
        - If not, redirects to login page.

kill switch in promise chain. if kill switch is set, exit out of the chain

Prototype: client refresh code
    - make sure it works even if computer suspended
    - constantly poll db for up-to-date information

    - sophisticated solution - setup connection b/t client and server, have client "ping" server, and if server has changed, send back new data, else just send "pong"

    All deltas for updating models have the following structure:
        1. all single-value keys are reproduced in the JSON, and is used to replace values
        2. all arrays / many-to-many links are represented as deltas, which is an object with an add and remove field, each with arrays of ids. 

Queue
{
    name: String,
    description: String,
    rooms: [Rooms],
    courses: [Courses],
    requests: [Requests]
    TAs: [Users]
    options: {} // TODO: things like whether or not comments are open, etc.
}

    
    /queue/:id - view the queue

    POST /api/queue/create - create a new queue
        will automatically create a policy for admin of the queue and the user.
    PUT /api/queue/:id
        put - update the queue details

        {
            name: String,
            description: String,
            rooms: {
                add: [String] // room ids
                remove: [String]
            }
            courses: { 
                add: [String] // course ids
                remove: [String]
            }
        }

    we want endpoints that allow for easy data collection
    hardcode common data collection endpoints
        optimize the indices for these endpoints
        
        ex: all requests from X to Y
        all requests by one person
        dump: json of all X between two dates
            so if you want to do something not allowed by queries, then get all data through dump and post-process manually.

Request {
    author: user // student
    course: Course
    message: String
    room: Room
    created: Date
    updated: Date
    status: [Open, Helped, Canceled, Hold] //hold would be a student ‘pausing’ the request if they need to leave but don’t want to take themselves off, etc.
    status_message_student: String // compliments or comments from student. String might not be the best format for this
    status_message_ta: String // compliments or comments from the TA
    helping_ta: user
    queue: Queue
}

    POST /api/queue/:id/requests - add a request
    GET /api/queue/:id/requests - get requests as JSON (including completed ones)
    GET /api/queue/:id/requests/:id - retrieve a single request
        PUT - update a request

Rooms {
    building: String
    number: String
}

    POST /api/rooms - add a room
    GET /api/rooms - retrieve all rooms as JSON
    GET /api/rooms/:id - retrieve a single room as JSON
        PUT /api/rooms/:id - update a room
        DELETE /api/rooms:id - delete a room


Course {
    name: String 
}

User
{
    id: String // we discussed something like having something separate from netid for this
    university_id: String
    name: String
}

    POST auth/login - logs in user, creates new user if doesn't exist
    POST /api/users - create a new user programmatically
    GET /api/users/:id - JSON representation of user

???????????
Group
{
   users: [Users]
   course: Course
   adhoc: Boolean // was this formed ahead of time, or at time of request
   created: Date
   validUntil: Date // not set until the group is dissolved. Unsure what to do with this if the group is an adhoc group
}

Policy // for TAs and other admins
{
   Queue: Queue
   Rooms: [Rooms]
   Courses: [Courses]
   Roles: [Site Admin, etc.] // any other administrative roles
}

    GET /api/queue/:id/policies - retrieve policies of a group
    GET /api/queue/:id/policies/:id - retrieve single policy
        PUT - update the policy
        DELETE - remove the policy (will not remove the last policy of a group)

        Update model (as a delta):

        {
            role: String,
            users: {
                add: [String],
                remove: [String]
            }
        }
# THIS IS OUTDATED AND HAS NOT BEEN UPDATED PROPERLY.

Please see `api.md` and `frontend.md` for better design notes!

Repo -> Accessor or Modifier

Policies will eventually also be backed by courses and rooms, so we will probably have to name them.

* Authentication:
    - every time you open the app / browser, need to set up a session by going to /login before you have the user (even if cookies exist)
        - If CAS is still active, then going to /login automatically gives you the session
        - If not, redirects to login page.

Prototype: client refresh code
    - make sure it works even if computer suspended
    - constantly poll db for up-to-date information

    - sophisticated solution - setup connection b/t client and server, have client "ping" server, and if server has changed, send back new data, else just send "pong"

    All deltas for updating models have the following structure:
        1. all single-value keys are reproduced in the JSON, and is used to replace values
        2. all arrays / many-to-many links are represented as deltas, which is an object with an add and remove field, each with arrays of ids. 

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

# WSSE

* API routes are only protected with WSSE (no CAS!)
* Ok to store WSSE keys as plaintext in the database and on the client
* STORE THE ACTUAL KEY AS A COOKIE, NOT THE WHOLE DIGEST
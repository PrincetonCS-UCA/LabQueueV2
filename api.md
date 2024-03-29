# Definitions

Some definitions before we get into technical detail of endpoints:

## Ids

Some of the fields are listed as `Model`IdString, where `Model` is replaced by one of the database models (Queue, Course, Room, User, Request, or Policy). Those fields are strings that represent an association, and generally refer to a unique Id for a given association. (Possibly have them be primary keys as well.)

TODO: figure out if we want to keep them all named as `id` as database fields for consistency, or if we want to have more descriptive names.

These Id strings should be lowercase and dash-separated, so that they are suitable for use in URLs (since a lot of the endpoints will refer to them.)

Id strings for each model are as follows:

* Queue - a user-generated name identifies the queue.
* Request - integer or random pickled / hashed string, autogenerated
* User - the CAS login Id for the user.
* Course - a string with the course number and semester. (possible example, `cos226-f2017`)
* Room - a string for building and room number. (possible example, `lewis-126`)
* Policy - TODO. possibly a user-supplied descriptive name? 

## Enums

*RoleEnum* - used for Policies, which determine what permissions users in that policy have.
    * `ta` - TAs can help and cancel requests
    * `admin`- admins have permissions akin to the owner of a queue

*StatusEnum* - used for Requests, determines the current status of the request
    * `inQueue` - the request is active and needs to be addressed
    * `canceled` - request has been canceled without help
    * `inProgress` - request has been acknowledged by a TA
    * `completed` - request has been completed

# Endpoints

Living document of all the endpoints, and what they should return.

## GET

### Basic Endpoints

*/queue/:queue* - retrieves the metadata of a queue. The metadata should look as follows:

    {
        id: QueueIdString, 
        caption: String,
        description: String,
        courseIds: [CourseIdString],
        roomsIds: [RoomIdString],
        ownerId: UserIdString
    }

*/queue/:queue/active* - retrieves all active requests of a queue as a list, in chronological order
*/queue/:queue/active/:user* - retrives the active request authored by a user
*/queue/:queue/requests/:request* - retrieves a single request (active or not)

    {
        id: RequestIdString,
        message: String,
        status: StatusString,
        queueId: QueueIdString,
        authorId: UserIdString,
        helperId: UserIdString,
        courseId: CourseIdString,
        roomId: RoomIdString
    }

*/queue/:queue/policies* - all policies on the queue
*/queue/:queue/policies/:policy* - a single policy on the queue
    
    {
        userIds: [{Users}],
        queueId: QueueIdString,
        role: RoleString,
        rules: [{Rules}]
    }
*/queue/:queue/users/:user/permissions* - returns the policies for a user on the queue.

### Data Collection Endpoints

TODO: figure out what to do about times. Should we require a querystring with times?

*/queue/:queue/users/:user/requests* - all requests by this user, active or not
*/queue/:queue/courses/:course/requests* - all requests for a course
*/queue/:queue/rooms/:room/requests* - all requests by for a room

## POST

*/queue* - create a queue, and makes a default policy with a single rule allowing all courses and rooms access.
*/queue/:queue/requests* - create a request in a queue, with the following fields:

    {
        message: String,
        courseId: CourseIdString,
        roomId: RoomIdString
    }

Status is automatically set as `inQueue`

*/queue/:queue/policies* - creates a policy, with the following fields:
    
    {
        role: String,
        rules: [{
            courseIds (optional): [String],
            roomIds (optional): [String]
        }]
    }


## PUT

Anytime a field is an array of associations, the update should be in the form of a delta:

For example, to edit the courseIds of a queue:

    {
        courseIds: {
            op: "set|add|remove",
            values: [CourseIdString]
        }
    }


*/queue/:queue* - edit metadata of the queue, as well as courses and rooms for that queue.

Requests can only be edited by authors, TAs of a queue, or the queue admin(s)

*/queue/:queue/requests/:request* - edit contents of a request
*/queue/:queue/requests/:request/cancel* - cancels a request
*/queue/:queue/requests/:request/claim* - sets request to inProgress, and sets current user as the helper. Completely unimplemented at the moment.
*/queue/:queue/requests/:request/complete* - completes a request

*/queue/:queue/policies/:policy* - edits details of a policy, including roles and users

## Authentication

* Check for WSSE key (to test API) first, and then if there is none provided, check CAS. 

If going through terminal / whatever, we need to set up a WSSE header and submit that.

Page Endpoints:
    * check if wsse cookie is set
        -if the wsse cookie doesn't work, unset it
    * if not, redirect to CAS
        - once authenticated, generate a key
    * set cookie to key

* WSSE is a username / password combo. Client applies WSSE to it and sends to server. Server has the correct username / password, and also applies WSSE to it to check if the two match.

We store actual WSSE password in the server, not the encoded result!

## Other Logic

### Check if a User has Permission for a specific Queue:

* Retrieve the Policy for the Queue associated with the User
* Parse the Rules for that Policy. For each rule:
    * check if the Course and the Room in the Request is in that rule. 
    * If so, return true
    * If not, go to the next one
* If we go through all the rules, return false

### Making sure that each User is in only one Policy per Queue

Is this necessary? 

The current implementation is a bit redundant; it will ensure there is only one policy per user per queue, but all the code will check all of the policies belonging to a user (looping through an array of policies), which will handle any cases where a user has multiple policies.
    
https://github.com/sequelize/sequelize/issues/4880

Policy Fields:
    setUsers / addUsers - query for a policy with that user, the same queue, and same role. If it already exists, then remove that user from the other policy first.

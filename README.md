# Directory Structure

    /api - all relevant server-side code for endpoint logic
        /v1 - top-level files are endpoint definitions
            /controllers - contains functions called at each endpoint
            /middleware - contains route middleware (functions resolved before calling the main logic of the endpoint)
            /accessors - contains functions that access database. 
        v1.js - packages up the serverside code to be included in the app
    /app - contains other application code besides code for the api / endpoints
        /client - a React mess. `index.jsx` is the main entry point
        /server - other serverside code.
            /views - views (using nunjucks) that are rendered server side.

    /config - contains application (serverside) configuration, including which view engines, passport setup, and database options
    /enums - contains enum definitions used by the rest of the app. JS doesn't support enums, so it's a bit hacky.
    /models - database models for Sequelize
    /public - static files
    /utils - one-off functions that are useful in various places

Main entry point into app is at `index.js`. Please also take a look at `frontend.md` and `api.md` for some design notes.

# Testing

There is now a test suite that can be run with the following commands:

    npm install
    ./test.sh

There aren't many tests right now, and some of them fail. They are currently used to ensure that nothing breaks during development.

# Other Notes

General structure of how the /api folder works is as follows:
* User hits an endpoint, which is defined in the top-level files in the /v1 folder.
* Any middleware for that endpoint is called
* The endpoint function is called (which is found in the /controllers folder)
    * A controller may call functions from the repository to manipulate the database


'use strict';

const Promise = require('bluebird');

module.exports = function(models) {

    function createOrFindRoom(roomId) {
        return models.Room.findCreateFind({
            where: {
                id: roomId
            }
        }).spread(function(dbRoom, created) {
            return Promise.resolve(dbRoom);
        });
    }

    function bulkCreateRooms(rooms) {
        return Promise.map(rooms, function(room) {
            return createOrFindRoom(room);
        });
    }

    return {
        createOrFindRoom: createOrFindRoom,
        bulkCreateRooms: bulkCreateRooms
    };

}
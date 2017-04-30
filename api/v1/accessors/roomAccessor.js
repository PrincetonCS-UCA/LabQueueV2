'use strict';

module.exports = function(models) {

    function createRoom(roomObj) {
        return models.Room.create(roomObj);
    }

    function createOrFindRoom(roomId) {
        return models.Room.findOne({
            where: {
                id: roomId
            }
        }).then(function(dbRoom) {
            if (!dbRoom) {
                return createRoom({
                    id: roomId
                });
            }
            return dbRoom.save();
        });
    }

    return {
        createRoom: createRoom,
        createOrFindRoom: createOrFindRoom
    };

}

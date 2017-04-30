module.exports = {
    generateKey: function(db, username, password, service, done) {
        return db.WSSEKey.destroy({
            where: {
                username: username,
                service: service
            }

        }).then(function() {
            return db.WSSEKey.create({
                username: username,
                service: service,
                key: password
            })
        }).then(function() {
            done();
        })
    },
    createCASUser: function createCASUser(db, casId, done) {

        return db.User.create({
            name: "Test User",
            casId: casId,
            universityId: casId
        }).then(function(user) {
            console.log(user);
            done()
        }).catch(function(err) {
            console.log(err);
        });

    }
}

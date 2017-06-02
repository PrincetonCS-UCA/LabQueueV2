module.exports = function(app, models) {

    var auth = require('../../api/v1/middleware/auth')(app, models);
    var authAccessor = require('../../api/v1/accessors/authAccessor')(models);
    var policyAccessor = require('../../api/v1/accessors/policyAccessor')(models);

    var policyTypes = require('../../enums/policyTypes');

    app.get('/', auth.casBounce(), function(req, res) {
        res.render('index', {
            user: JSON.stringify(req.user)
        });
    });

    app.get('/queue/:queue', auth.casBounce(), function(req, res, next) {

        policyAccessor.findPoliciesByUser(req.queue.id, req.user.id).bind({}).then(function(
            policies) {

            this.policies = policies;

            return authAccessor.isRole(req.queue.id, req.user.id, policyTypes.ta);

        }).then(function(role) {

            res.render('queue', {
                user: JSON.stringify(req.user),
                is_ta: role,
                queue: JSON.stringify(req.queue),
                policies: JSON.stringify(this.policies)
            })
        }).catch(function(err) {
            next(err);
        })

    })
}
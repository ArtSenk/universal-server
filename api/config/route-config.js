'use strict';

(function (routeConfig) {
    routeConfig.init = function (app) {
        const general = require('../routes/general');
        const userRoutes = require('../routes/user');

        app.use('/', general);
        app.use(userRoutes);

        app.get('*', function(req, res, next) {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        app.post('*', function(req, res, next) {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        app.use(function (err, req, res, next) {
            if(err.status !== 404) {
                console.error(err.stack.substr(0, 750));
            }
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.status(err.status || 500);
            res.render("error.ejs");
            res.end();
        });
    };
})(module.exports);
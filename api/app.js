const express    = require('express'),
      logger     = require('morgan'),
      bodyParser = require('body-parser'),
      app        = express();

const routeConfig = require('./config/route-config.js');

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: false}));
app.use(function(req, res, next) {
    helpers.logger.logIncomingRequest(req.method + ' ' + req.url, {get: req.query, post: req.body} );
    next();
});
routeConfig.init(app);

module.exports = app;
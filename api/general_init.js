var yaml = require("js-yaml");
var fs = require('fs');
var extend = require("extend");

config = {};
globals = {};

config.localConfig = __dirname + '/config/config.yml';

globals.workers = [];
globals.workerENV = {};

helpers = {};
helpers.logger = require('./helpers/logger');
helpers.general = require('./helpers/general');
helpers.user = require('./helpers/user');

controllers = {};
controllers.user = require('./controllers/user');
controllers.general = require('./controllers/general');

globals.errors = {};
globals.errors.ERROR_GENERAL = 100;
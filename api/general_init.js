const yaml = require("js-yaml");
const fs = require('fs');
const extend = require("extend");

config = {};
globals = {};

globals.nodemailer = require("nodemailer");

config.appStore = __dirname + '/config/config.yml';
globals.apple = require("in-app-purchase");
appStore = yaml.load(fs.readFileSync(config.appStore));
config = extend(config, appStore);

config.googlePlay = __dirname + '/config/config.yml';
googlePlay = yaml.load(fs.readFileSync(config.googlePlay));
config = extend(config, googlePlay);

config.nodemailerService = __dirname + '/config/config.yml';
nodemailerService = yaml.load(fs.readFileSync(config.nodemailerService));
config = extend(config, nodemailerService);

config.encryptionKey = __dirname + '/config/encryption_key.yml';
encryptionKey = yaml.load(fs.readFileSync(config.encryptionKey));
config = extend(config, encryptionKey);

config.auth = __dirname + '/config/config.yml';
auth = yaml.load(fs.readFileSync(config.auth));
config = extend(config, auth);

config.appVersion = __dirname + '/version';
globals.version = fs.readFileSync(config.appVersion, 'utf8');

config.server = __dirname + '/config/config.yml';
server = yaml.load(fs.readFileSync(config.server));
config = extend(config, server);

config.resetPasswordUrl = __dirname + '/config/config.yml';
resetPasswordUrl = yaml.load(fs.readFileSync(config.resetPasswordUrl));
config = extend(config, resetPasswordUrl);

config.environments = __dirname + '/config/config.yml';
environments = yaml.load(fs.readFileSync(config.environments));
config = extend(config, environments);

config.localConfig = __dirname + '/config/config.yml';

/*globals.httpsOptions = {
    key: fs.readFileSync(__dirname + '/certificate.key'),
    cert: fs.readFileSync(__dirname + '/certificate.crt'),
    ca: fs.readFileSync(__dirname + '/comodoca.crt'),
};*/

globals.workers = [];
globals.workerENV = {};

helpers = {};
helpers.logger = require('./helpers/logger');
helpers.general = require('./helpers/general');
helpers.user = require('./helpers/user');

controllers = {};
controllers.user = require('./controllers/user');
controllers.general = require('./controllers/general');

ERROR = {
    GENERAL: 100,
    USER_NOT_FOUND: 110,
    TOKEN_NOT_FOUND: 115,
    RECEIPT_NOT_FOUND: 120,
    ACTIVITIES_NOT_FOUND: 125,
    SERVER: 500
};
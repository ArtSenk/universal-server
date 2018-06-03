const auth = require('basic-auth');
require('../general_init.js');

function getServerVersion(req, res) {
    if (globals.version) {
        helpers.general.returnResponse(res, {version: globals.version}, 'getServerVersion');
    } else {
        helpers.logger.log('/version: undefined version', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnError(res, {
            error: ERROR.GENERAL,
            message: 'undefined version'
        }, 'getServerVersion');
    }
}

function checkVersionCompatibility(req, res) {
    if (req.params.api_version === 'v1') {
        const clientVersion = helpers.general.getRequestValue(req, 'clientVersion');

        if (!clientVersion) {
            helpers.logger.log('/server: clientVersion not set', helpers.logger.LOG_TYPE_ERROR, 'checkVersionCompatibility');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'clientVersion not set'
            }, 'checkVersionCompatibility');
        }

        if (clientVersion < config.server.minVersion) {
            helpers.general.returnResponse(res, {
                correctVersion: false
            }, 'checkVersionCompatibility');
        } else {
            helpers.general.returnResponse(res, {
                correctVersion: true
            }, 'checkVersionCompatibility');
        }
    } else {
        helpers.logger.log('/server: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'checkVersionCompatibility');
    }
}

function rereadFile(req, res) {
    const user = auth(req);

    if (!user || user.name !== config.auth.user || user.pass !== config.auth.password) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="config"');
        return res.end('Access denied');
    }
    res.setHeader('Content-Type', 'application/json');

    const type = req.params.type;
    if (type) {
        helpers.logger.log('type is ' + type, helpers.logger.LOG_TYPE_INFO);
        helpers.general.sendReread(req.params);
        helpers.general.returnResponse(res, {status: 'success'}, 'rereadFile');
    } else {
        helpers.logger.log('/reread/:type: type not set', helpers.logger.LOG_TYPE_ERROR, 'rereadFile');
        return helpers.general.returnError(res, {
            error: ERROR.GENERAL,
            message: 'type not set'
        }, 'rereadFile');
    }
}

module.exports = {
    getServerVersion,
    checkVersionCompatibility,
    rereadFile
};
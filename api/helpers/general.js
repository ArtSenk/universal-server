const crypto = require('crypto');
const yaml = require("js-yaml");
const fs = require('fs');
const extend = require("extend");
const https = require('https');
require('../general_init.js');

function encrypt(text) {
    const algorithm = 'aes-256-ctr';
    const key = config.encryption.key;

    const cipher = crypto.createCipher(algorithm, key);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    const algorithm = 'aes-256-ctr';
    const key = config.encryption.key;

    const decipher = crypto.createDecipher(algorithm, key);
    let deciphered = decipher.update(text, 'hex', 'utf8');
    deciphered += decipher.final('utf8');
    return deciphered;
}

function sendReread(params) {
    let toSend = {
        type: 'reread',
        params: params,
        workerIndex: process.env.WORKER_INDEX
    };
    process.send(toSend);
}

function rereadConfig(callback) {
    helpers.logger.log('rereading config', helpers.logger.LOG_TYPE_INFO);

    serverConfig = yaml.load(fs.readFileSync(config.localConfig));
    config = extend(config, serverConfig);
    callback();
}

function getErrorAsString(error, request) {
    let toReturn = '';

    if (error instanceof Error) {
        toReturn = 'Exception: ' + error.stack;
    } else {
        toReturn = error;
        if (error + '' === '[object Object]') {
            toReturn = JSON.stringify(error);
        }
    }

    request = request || false;
    toReturn = toReturn.substr(0, 1300);

    if (request) {
        toReturn = "\nParams are: " + JSON.stringify(request.params) + "\nBody is: " + JSON.stringify(request.body) + "\nTrace: " + toReturn;
    }
    return toReturn;
}

function returnError(res, data, from, skipLog) {
    res.status(500);

    if (typeof skipLog === 'undefined') {
        skipLog = false;
    }
    if (!skipLog) {
        if (from) {
            from = from + ' ';
        } else {
            from = '';
        }
        helpers.logger.log(from + JSON.stringify(data), helpers.logger.LOG_TYPE_RESPONSE);
    }
    res.json(data);
    return res.end();
}

function returnResponse(res, data, from, skipLog) {
    res.status(200);

    if (typeof skipLog === 'undefined') {
        skipLog = false;
    }
    res.json(data);
    if (!skipLog) {
        if (from) {
            from = from + ' ';
        }
        helpers.logger.log(from + JSON.stringify(data), helpers.logger.LOG_TYPE_RESPONSE);
    }
    return res.end();
}

function getRequestValue(req, name) {
    if (typeof req.query[name] !== 'undefined') {
        return req.query[name];
    }
    if (typeof req.params[name] !== 'undefined') {
        return req.params[name];
    }
    if (typeof req.body[name] !== 'undefined') {
        return req.body[name];
    }
}

module.exports = {
    encrypt,
    decrypt,
    sendReread,
    rereadConfig,
    getErrorAsString,
    returnError,
    returnResponse,
    getRequestValue
};
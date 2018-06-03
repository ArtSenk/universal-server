const LOG_TYPE_NOTICE = 'noti';
const LOG_TYPE_INFO = 'info';
const LOG_TYPE_RESPONSE = 'resp';
const LOG_TYPE_REQUEST = 'requ';
const LOG_TYPE_ERROR = 'errm';

debugMain = require('../libs/debug');

debugError = debugMain(LOG_TYPE_ERROR);
debugError.log = console.log.bind(console);
debugInfo = debugMain(LOG_TYPE_INFO);
debugInfo.log = console.log.bind(console);
debugReponse = debugMain(LOG_TYPE_RESPONSE);
debugReponse.log = console.log.bind(console);
debugRequest = debugMain(LOG_TYPE_REQUEST);
debugRequest.log = console.log.bind(console);
debugNotice = debugMain(LOG_TYPE_NOTICE);
debugNotice.log = console.log.bind(console);

debugs = {
    errm: debugError,
    info: debugInfo,
    resp: debugReponse,
    requ: debugRequest,
    noti: debugNotice,
};

/**
 * @param message
 * @param type
 * @param issuer (socketId or user)
 */
function log(message, type, issuer, key) {
    if (issuer) {
        if (typeof issuer._id !== 'undefined') {
            // this is user
            var user = issuer;
        } else {
            // this is socketId
            var socketId = issuer
        }
        message = 'https ' + helpers.user.getUserString(user) + ' ' + message
    }
    consoleLog(message, type, socketId);
}

function consoleLog(message, type) {
    if (true) {
        type = type || LOG_TYPE_INFO;

        if (type === LOG_TYPE_RESPONSE) {
            message = '<<<________ ' + message;
        }
        if (type === LOG_TYPE_REQUEST) {
            message = '________>>> ' + message;
        }

        let debug = debugs[type];
        let index = process.env.WORKER_INDEX;

        if (typeof index === 'undefined') {
            index = 'm';
        }
        message = process.pid + ',' + index + '| ' + message;
        debug(message);
        if(type === LOG_TYPE_ERROR) {
            console.log('second time:');
            console.log(message);
        }
    }
}

function logIncomingRequest(text, message) {
    log('incoming ' + text + ': ' + JSON.stringify(message), helpers.logger.LOG_TYPE_REQUEST);
}

module.exports = {
    log,
    logIncomingRequest,
    LOG_TYPE_INFO,
    LOG_TYPE_NOTICE,
    LOG_TYPE_RESPONSE,
    LOG_TYPE_REQUEST,
    LOG_TYPE_ERROR,
};
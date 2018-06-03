require('../general_init.js');

function getErrorAsString(error, request) {
    var toReturn = '';
    if(error instanceof Error) {
        toReturn = 'Exception: ' + error.stack;
    } else {
        toReturn = error;
        if(error + '' == '[object Object]') {
            toReturn = JSON.stringify(error);
        }
    }

    request = request || false;
    toReturn = toReturn.substr(0, 1300);

    if(request) {
        toReturn = "\nParams are: " + JSON.stringify(request.params) + "\nBody is: " + JSON.stringify(request.body) + "\nTrace: " + toReturn;
    }
    return toReturn;
}

function returnError(res, data, from, skipLog) {
    res.status(500);
    if(typeof skipLog == 'undefined') {
        skipLog = false;
    }
    if(!skipLog) {
        if(from) {
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
    if(typeof skipLog == 'undefined') {
        skipLog = false;
    }
    res.json(data);
    if(!skipLog) {
        if(from) {
            from = from + ' ';
        }
        helpers.logger.log(from + JSON.stringify(data), helpers.logger.LOG_TYPE_RESPONSE);
    }
    return res.end();
}

module.exports = {
    getErrorAsString,
    returnError,
    returnResponse
};



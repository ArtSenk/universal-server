const express = require('express');
const router = express.Router();

require('../general_init.js');

/**
 * @swagger
 * /version:
 *   get:
 *     description: Get server version
 *     parameters: []
 *     responses:
 *       200:
 *         description: success
 *         parameters: [version: '[server version]']
 *         500: error
 */
router.get('/version', controllers.general.getServerVersion);

/**
 * @swagger
 * /:api_version/server:
 *   get:
 *     description: Compatibility check
 *     parameters: [api_version, clientVersion]
 *     responses:
 *       200:
 *         description: success
 *         parameters: [correctVersion: true/false]
 *         500: error
 */
router.all('/:api_version/server', controllers.general.checkVersionCompatibility);

/**
 * @swagger
 * /reread/:type:
 *   get:
 *     description: Reread the file by type. Example request 'https://user:password@my.iridescent.studio:8443/reread/config'
 *     parameters: [type (ex. 'config')]
 *     responses:
 *       200:
 *         description: success
 *         parameters: [status: 'success']
 *         500: error
 */
router.get('/reread/:type', controllers.general.rereadFile);

module.exports = router;
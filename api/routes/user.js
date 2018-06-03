const express = require('express');
const router = express.Router();

require('../general_init.js');

/**
 * @swagger
 * /:api_version/user/exists:
 *   post:
 *     description: Checking the user in the database
 *     parameters: [api_version, email]
 *     responses:
 *       200:
 *         description: User exists or does not exists
 *         parameters: [exists: true/false]
 *         errors: 100
 *       500:
 *         description: Some server problems
 *         parameters: [error: 100]
 */
router.post('/:api_version/user/exists', controllers.user.checkUser);

/**
 * @swagger
 * /:api_version/user/signup:
 *   post:
 *     description: User registration
 *     parameters: [api_version, email, password]
 *     responses:
 *       200:
 *         description: Successful registration
 *         parameters: [userExists: false, token: tokenString]
 *       500: error
 */
router.post('/:api_version/user/signup', controllers.user.signUp);

/**
 * @swagger
 * /:api_version/user/signin:
 *   post:
 *     description: User login
 *     parameters: [api_version, email, password]
 *     responses:
 *       200:
 *         description: Successful login
 *         parameters: [correctPassword: true, token: tokenString]
 *       500: error
 */
router.post('/:api_version/user/signin', controllers.user.signIn);

/**
 * @swagger
 * /:api_version/user/logout:
 *   get:
 *     description: User logout
 *     parameters: [api_version, token]
 *     responses:
 *       200:
 *         description: Successful logout
 *         parameters: [tokenDestroyed: true]
 *         500: error
 */
router.get('/:api_version/user/logout', controllers.user.logout);

/**
 * @swagger
 * /:api_version/user/profile:
 *   get:
 *     description: Get a user profile
 *     parameters: [api_version, token]
 *     responses:
 *       200:
 *         description: User profile received
 *         parameters: [userData: toReturn]
 *         500: error
 */
router.get('/:api_version/user/profile', controllers.user.getUserProfile);

/**
 * @swagger
 * /:api_version/user/profile:
 *   post:
 *     description: Updating user profile
 *     parameters: [api_version, token, data]
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         parameters: [updatedProfile: true]
 *         500: error
 */
router.post('/:api_version/user/profile', controllers.user.updateUserProfile);

/**
 * @swagger
 * /:api_version/user/subscribe:
 *   post:
 *     description: Create user subscription
 *     parameters: [api_version, token, receipt, store]
 *     responses:
 *       200:
 *         description: User received a subscription
 *         parameters: [newSubscription: true/false]
 *         500: error
 */
router.post('/:api_version/user/subscribe', controllers.user.createUserSubscription);

/**
 * @swagger
 * /:api_version/user/reset_password:
 *   post:
 *     description: Reset user password
 *     parameters: [api_version, email]
 *     responses:
 *       200:
 *         description: User password reset
 *         parameters: [newPassword: true]
 *         500: error
 */
router.post('/:api_version/user/reset_password', controllers.user.resetUserPassword);

/**
 * @swagger
 * /:api_version/user/check_password:
 *   get:
 *     description: Checking the entered user password with the password in the database.
 *     parameters: [api_version, token, password]
 *     responses:
 *       200:
 *         description: success
 *         parameters: [correctPassword: true/false]
 *         500: error
 */
router.get('/:api_version/user/check_password', controllers.user.checkUserPassword);

/**
 * @swagger
 * /:api_version/user/password:
 *   post:
 *     description: Change the old user password to new password.
 *     parameters: [api_version, token, oldPassword, newPassword]
 *     responses:
 *       200:
 *         description: User password updated.
 *         parameters: [passwordUpdated: true/false]
 *         500: error
 */
router.post('/:api_version/user/password', controllers.user.updateUserPassword);

/**
 * @swagger
 * /:api_version/user/activity:
 *   post:
 *     description: Create user activity per day
 *     parameters: [api_version, token, date, data]
 *     responses:
 *       200:
 *         description: User activity per day added to database
 *         parameters: [activityCreated: true]
 *         500: error
 */
router.post('/:api_version/user/activity', controllers.user.createUserActivity);

/**
 * @swagger
 * /:api_version/user/activities:
 *   get:
 *     description: Get user activities per day or per month
 *     parameters: [api_version, token, startDate, endDate]
 *     responses:
 *       200:
 *         description: success
 *         parameters: [activities: dataArray]
 *         500: error
 */
router.get('/:api_version/user/activities', controllers.user.getUserActivities);

/**
 * @swagger
 * /:api_version/user/game/progress:
 *   post:
 *     description: Keeps the progress of users in games.
 *     parameters: [api_version, token, gameId, data]
 *     responses:
 *       200:
 *         description: User's gameplay is added to the database
 *         parameters: [added: true]
 *         500: error
 */
router.post('/:api_version/user/game/progress', controllers.user.createUserGameProgress);

module.exports = router;
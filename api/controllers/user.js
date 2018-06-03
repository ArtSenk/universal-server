const iap = require('in-app-purchase');
const nodemailer = require('nodemailer');

const User = require('../models/index').User;
const Token = require('../models/index').Token;
const Transaction = require('../models/index').Transaction;
const Subscription = require('../models/index').Subscription;
const GroupSubscription = require('../models/index').GroupSubscription;
const Receipt = require('../models/index').Receipt;
const UserGames = require('../models/index').UserGames;
const Activities = require('../models/index').Activities;

require('../general_init.js');

function signUp(req, res) {
    if (req.params.api_version === 'v1') {
        const email = helpers.general.getRequestValue(req, 'email');
        const password = helpers.general.getRequestValue(req, 'password');

        if (!email) {
            helpers.logger.log('/user/signup: email not set', helpers.logger.LOG_TYPE_ERROR, 'signUp');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'email not set'
            }, 'signUp');
        }
        if (!password) {
            helpers.logger.log('/user/signup: password not set', helpers.logger.LOG_TYPE_ERROR, 'signUp');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'password not set'
            }, 'signUp');
        }

        User.findOne({where: {email: helpers.general.encrypt(email)}}).then(function (user) {
            if (user) {
                helpers.general.returnResponse(res, {userExists: true}, 'signUp');
            } else {
                User.create({email: helpers.general.encrypt(email)}).then(function (user) {
                    const tokenString = helpers.user.generateToken();
                    helpers.user.createToken(tokenString, user.id);
                    helpers.user.saltHashPassword(password, user);

                    helpers.general.returnResponse(res, {
                        userExists: false,
                        token: tokenString
                    }, 'signUp');
                })
                    .catch(function (error) {
                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'signUp');
                    });
            }
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'signUp');
            });
    } else {
        helpers.logger.log('/user/signup: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'signUp');
    }
}

function signIn(req, res) {
    if (req.params.api_version === 'v1') {
        const email = helpers.general.getRequestValue(req, 'email');
        const password = helpers.general.getRequestValue(req, 'password');

        if (!email) {
            helpers.logger.log('/user/signin: email not set', helpers.logger.LOG_TYPE_ERROR, 'signIn');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'email not set'
            }, 'signIn');
        }
        if (!password) {
            helpers.logger.log('/user/signin: password not set', helpers.logger.LOG_TYPE_ERROR, 'signIn');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'password not set'
            }, 'signIn');
        }

        User.findOne({where: {email: helpers.general.encrypt(email)}}).then(function (user) {
            if (!user) {
                helpers.logger.log('/user/signin: ' + 'user not found in database ' + helpers.general.getRequestValue(req, 'email'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.USER_NOT_FOUND,
                    message: 'user not found in database '
                }, 'signIn');
            }

            if (helpers.user.compareCode(password, user.password, user.salt)) {
                const tokenString = helpers.user.generateToken();
                helpers.user.createToken(tokenString, user.id);

                helpers.general.returnResponse(res, {
                    correctPassword: true,
                    token: tokenString
                }, 'signIn');
            } else {
                helpers.general.returnResponse(res, {correctPassword: false}, 'signIn');
            }
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'signIn');
            });
    } else {
        helpers.logger.log('/user/signin: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'signIn');
    }
}

function logout(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');

        if (!token) {
            helpers.logger.log('/user/logout: token not set', helpers.logger.LOG_TYPE_ERROR, 'logout');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'logout');
        }

        Token.destroy({where: {token: token}}).then(function () {
            helpers.general.returnResponse(res, {tokenDestroyed: true}, 'logout');
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'logout');
            });
    } else {
        helpers.logger.log('/user/logout: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'logout');
    }
}

function getUserProfile(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');

        if (!token) {
            helpers.logger.log('/user/profile: token not set', helpers.logger.LOG_TYPE_ERROR, 'getUserProfile');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'getUserProfile');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/profile: ' + 'token not found in database ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database '
                }, 'getUserProfile');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/profile: ' + 'user not found in database', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database'
                    }, 'getUserProfile');
                }

                let toReturn = {};

                toReturn.id = user.id;
                toReturn.username = user.username;
                toReturn.isEmailsAllowed = user.isEmailsAllowed;

                if (user.email) {
                    toReturn.email = helpers.general.decrypt(user.email);
                }
                if (user.subscribedUntil >= new Date()) {
                    toReturn.isSubscribed = true;
                } else {
                    toReturn.isSubscribed = false;
                }
                if (user.activityDays) {
                    toReturn.activityDays = user.activityDays;
                } else {
                    toReturn.activityDays = 0;
                }
                if (user.password || user.facebookId) {
                    toReturn.isGuest = false;
                } else {
                    toReturn.isGuest = true;
                }

                return helpers.general.returnResponse(res, {userData: toReturn}, 'getUserProfile');
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'getUserProfile');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'getUserProfile');
            });
    } else {
        helpers.logger.log('/user/profile: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'getUserProfile');
    }
}

function updateUserProfile(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const data = helpers.general.getRequestValue(req, 'data');

        if (!token) {
            helpers.logger.log('/user/profile: token not set', helpers.logger.LOG_TYPE_ERROR, 'updateUserProfile');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'updateUserProfile');
        }
        if (!data) {
            helpers.logger.log('/user/profile: data not set', helpers.logger.LOG_TYPE_ERROR, 'updateUserProfile');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'data not set'
            }, 'updateUserProfile');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/profile: ' + 'token not found in database ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database'
                }, 'updateUserProfile');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/profile: ' + 'user not found in database', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database'
                    }, 'updateUserProfile');
                }

                const dataObject = JSON.parse(data);

                if (dataObject.isEmailsAllowed !== null) {
                    user.update({isEmailsAllowed: dataObject.isEmailsAllowed})
                        .catch(function (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'updateUserProfile');
                        });
                }
                if (dataObject.username) {
                    toReturn.username = dataObject.username;

                    user.update({
                        username: JSON.stringify(dataObject.username).slice(1, -1)
                    })
                        .catch(function (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'updateUserProfile');
                        });
                }

                return helpers.general.returnResponse(res, {updatedProfile: true}, 'updateUserProfile');
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'updateUserProfile');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'updateUserProfile');
            });
    } else {
        helpers.logger.log('/user/profile: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'updateUserProfile');
    }
}

function createUserSubscription(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const receiptFromTheStore = helpers.general.getRequestValue(req, 'receipt');
        const store = helpers.general.getRequestValue(req, 'store');

        if (!token) {
            helpers.logger.log('/user/subscribe: token not set', helpers.logger.LOG_TYPE_ERROR, 'createUserSubscription');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'createUserSubscription');
        }
        if (!receiptFromTheStore) {
            helpers.logger.log('/user/subscribe: receiptFromTheStore not set', helpers.logger.LOG_TYPE_ERROR, 'createUserSubscription');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'receiptFromTheStore not set'
            }, 'createUserSubscription');
        }
        if (!store) {
            helpers.logger.log('/user/subscribe: store not set', helpers.logger.LOG_TYPE_ERROR, 'createUserSubscription');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'store not set'
            }, 'createUserSubscription');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/subscribe: ' + 'token not found in database ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database'
                }, 'createUserSubscription');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/subsribe: ' + 'user not found in database', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database'
                    }, 'createUserSubscription');
                }

                if (store === 'apple') {
                    iap.config({
                        applePassword: config.apple.secret
                    });

                    iap.setup(function (error) {
                        if (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                        }
                        iap.validate(receiptFromTheStore, function (error, appleResponse) {
                            if (error) {
                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                            }
                            if (iap.isValidated(appleResponse)) {
                                let purchaseDataList = iap.getPurchaseData(appleResponse);

                                purchaseDataList.sort(helpers.user.compareExpirationDate);

                                const originalTransactionId = JSON.parse(purchaseDataList[0].originalTransactionId);
                                const expirationDate = new Date(JSON.parse(purchaseDataList[0].expirationDate));
                                const purchaseDate = new Date(JSON.parse(purchaseDataList[0].purchaseDateMs));

                                let uniqOrigTransIdObj = {};
                                for (let i = 0; i < purchaseDataList.length; i++) {
                                    uniqOrigTransIdObj[purchaseDataList[i].originalTransactionId] = true;
                                }

                                Subscription.findAll({where: {originalTransactionId: Object.keys(uniqOrigTransIdObj)}}).then(function (subscription) {
                                    if (!subscription || subscription.length === 0) {
                                        return GroupSubscription.create().then(function (groupSubscription) {
                                            return Subscription.create({
                                                userId: user.id,
                                                groupSubscriptionId: groupSubscription.id,
                                                originalTransactionId: originalTransactionId,
                                                purchaseDate: purchaseDate,
                                                expirationDate: expirationDate
                                            }).then(function (subscription) {
                                                return Receipt.create({
                                                    userId: user.id,
                                                    rawReceipt: receiptFromTheStore
                                                }).then(function (receipt) {
                                                    return Transaction.create({
                                                        userId: user.id,
                                                        subscriptionId: subscription.id,
                                                        receiptId: receipt.id,
                                                        store: store,
                                                        status: 'done'
                                                    }).then(function () {
                                                        user.update({
                                                            subscribedSince: purchaseDate,
                                                            subscribedUntil: expirationDate
                                                        });

                                                        return helpers.general.returnResponse(res, {newSubscription: true}, 'createUserSubscribe');
                                                    })
                                                        .catch(function (error) {
                                                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                        });
                                                })
                                                    .catch(function (error) {
                                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                    });
                                            })
                                                .catch(function (error) {
                                                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                });
                                        })
                                            .catch(function (error) {
                                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                            });
                                    }

                                    let expiration = false;
                                    for (let i = 0; i < subscription.length; i++) {
                                        if (subscription[i].userId !== user.id) {
                                            Receipt.findOne({where: {userId: subscription[i].userId}}).then(function (receipt) {
                                                if (!receipt) {
                                                    helpers.logger.log('/user/subsribe: ' + 'receipt not found in database', helpers.logger.LOG_TYPE_ERROR);
                                                    return helpers.general.returnResponse(res, {
                                                        error: ERROR.RECEIPT_NOT_FOUND,
                                                        message: 'receipt not found in database'
                                                    }, 'createUserSubscription');
                                                }

                                                Transaction.findOne({where: {userId: subscription[i].userId}}).then(function (transaction) {
                                                    if (!transaction) {
                                                        helpers.logger.log('createUserSubscription() no transacions for subscription (current user.id ' + user.id + ') ' + JSON.stringify(subscription), helpers.logger.LOG_TYPE_INFO);
                                                    } else {
                                                        receipt.update({userId: user.id}).then(function () {
                                                            subscription[i].update({userId: user.id}).then(function () {
                                                                transaction.update({userId: user.id})
                                                                    .catch(function (error) {
                                                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                                    });
                                                            })
                                                                .catch(function (error) {
                                                                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                                });
                                                        })
                                                            .catch(function (error) {
                                                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                            });
                                                    }
                                                })
                                                    .catch(function (error) {
                                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                    });
                                            })
                                                .catch(function (error) {
                                                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                });
                                        }

                                        if (new Date(subscription[i].expirationDate).getTime() === new Date(expirationDate).getTime()) {
                                            expiration = true;

                                            user.update({
                                                subscribedSince: purchaseDate,
                                                subscribedUntil: expirationDate
                                            })
                                                .catch(function (error) {
                                                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                                                });
                                        }
                                    }

                                    if (expiration === false) {
                                        GroupSubscription.create().then(function (groupSubscription) {
                                            Subscription.create({
                                                userId: user.id,
                                                groupSubscriptionId: groupSubscription.id,
                                                originalTransactionId: originalTransactionId,
                                                purchaseDate: purchaseDate,
                                                expirationDate: expirationDate
                                            }).then(function (subscription) {
                                                Receipt.create({
                                                    userId: user.id,
                                                    rawReceipt: receiptFromTheStore
                                                }).then(function (receipt) {
                                                    Transaction.create({
                                                        userId: user.id,
                                                        subscriptionId: subscription.id,
                                                        receiptId: receipt.id,
                                                        store: store,
                                                        status: 'done'
                                                    }).then(function () {
                                                        user.update({
                                                            subscribedSince: purchaseDate,
                                                            subscribedUntil: expirationDate
                                                        });

                                                        return helpers.general.returnResponse(res, {
                                                            newSubscription: true
                                                        }, 'createUserSubscribe');
                                                    })
                                                        .catch(function (error) {
                                                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                        });
                                                })
                                                    .catch(function (error) {
                                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                    });
                                            })
                                                .catch(function (error) {
                                                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                                });
                                        })
                                            .catch(function (error) {
                                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                            });
                                    } else {
                                        return helpers.general.returnResponse(res, {
                                            newSubscription: false
                                        }, 'createUserSubscribe');
                                    }
                                })
                                    .catch(function (error) {
                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscribe');
                                    });
                            }
                        });
                    });
                } else if (store === 'google') {
                    iap.config({
                        googlePublicKeyPath: process.cwd() + "/api/config/",
                        googleAccToken: config.googlePlay.googleAccToken,
                        googleRefToken: config.googlePlay.googleRefToken,
                        googleClientID: config.googlePlay.googleClientID,
                        googleClientSecret: config.googlePlay.googleClientSecret
                    });

                    iap.setup(function (error) {
                        if (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                        }
                        iap.validate(JSON.parse(receiptFromTheStore), function (error, googleResponse) {
                            if (error) {
                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                            }
                            if (iap.isValidated(googleResponse)) {
                                var purchaseDataList = iap.getPurchaseData(googleResponse);
                                const expirationDate = new Date(JSON.parse(purchaseDataList[0].expirationDate));
                                const purchaseDate = new Date(JSON.parse(purchaseDataList[0].purchaseDate));

                                GroupSubscription.create().then(function (groupSubscription) {
                                    Subscription.create({
                                        userId: user.id,
                                        groupSubscriptionId: groupSubscription.id,
                                        purchaseDate: purchaseDate,
                                        expirationDate: expirationDate
                                    }).then(function (subscription) {
                                        Receipt.create({
                                            userId: user.id,
                                            rawReceipt: receiptFromTheStore
                                        }).then(function (receipt) {
                                            Transaction.create({
                                                userId: user.id,
                                                subscriptionId: subscription.id,
                                                receiptId: receipt.id,
                                                store: store,
                                                status: 'done'
                                            }).then(function () {
                                                user.update({
                                                    subscribedSince: purchaseDate,
                                                    subscribedUntil: expirationDate
                                                }).then(function () {
                                                    return helpers.general.returnResponse(res, {newSubscription: true}, 'createUserSubscription');
                                                })
                                                    .catch(function (error) {
                                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                                                    });
                                            })
                                                .catch(function (error) {
                                                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                                                });
                                        })
                                            .catch(function (error) {
                                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                                            });
                                    })
                                        .catch(function (error) {
                                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                                        });
                                })
                                    .catch(function (error) {
                                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                                    });
                            }
                        });
                    });
                } else {
                    helpers.logger.log('/user/subscribe: undefined parameter', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.GENERAL,
                        message: 'undefined parameter'
                    }, 'createUserSubscription');
                }
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserSubscription');
            });
    } else {
        helpers.logger.log('/user/subscribe: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'createUserSubscription');
    }
}

function checkUser(req, res) {
    if (req.params.api_version === 'v1') {
        const email = helpers.general.getRequestValue(req, 'email');

        if (!email) {
            helpers.logger.log('/user/exists: email not set', helpers.logger.LOG_TYPE_ERROR, 'checkUser');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'email not set'
            }, 'checkUser');
        }

        User.findOne({where: {email: helpers.general.encrypt(email)}}).then(function (user) {
            if (user) {
                helpers.general.returnResponse(res, {exists: true}, 'checkUser');
            } else {
                helpers.general.returnResponse(res, {exists: false}, 'checkUser');
            }
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'checkUser');
            });
    } else {
        helpers.logger.log('/user/exists: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'checkUser');
    }
}

function resetUserPassword(req, res) {
    if (req.params.api_version === 'v1') {
        const email = helpers.general.getRequestValue(req, 'email');

        if (!email) {
            helpers.logger.log('/user/reset_password: email not set', helpers.logger.LOG_TYPE_ERROR);
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'email not set'
            }, 'resetUserPassword');
        }

        User.findOne({where: {email: helpers.general.encrypt(email)}}).then(function (user) {
            if (!user) {
                helpers.logger.log('/user/reset_password: ' + 'user not found in database ' + helpers.general.getRequestValue(req, 'email'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.USER_NOT_FOUND,
                    message: 'user not found in database'
                }, 'resetUserPassword');
            }

            const newPassword = helpers.user.generatePassword();
            helpers.user.saltHashPassword(newPassword, user);

            const transporter = nodemailer.createTransport({
                host: config.nodemailer.host,
                port: 587,
                secure: false,
                auth: {
                    user: config.nodemailer.user,
                    pass: config.nodemailer.pass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            const mailOptions = {
                from: '"universal-server" <universal.server.nodemailer@gmail.com>',
                to: email,
                subject: 'New Password',
                html: '<p>Your new password: ' + newPassword
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'resetUserPassword');
                } else {
                    helpers.general.returnResponse(res, {newPassword: true}, 'resetUserPassword');
                }
            });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'resetUserPassword');
            });
    } else {
        helpers.logger.log('/user/reset_password: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'resetUserPassword');
    }
}

function checkUserPassword(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const password = helpers.general.getRequestValue(req, 'password');

        if (!token) {
            helpers.logger.log('/user/check_password: token not set', helpers.logger.LOG_TYPE_ERROR);
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'checkUserPassword');
        }
        if (!password) {
            helpers.logger.log('/user/check_password: password not set', helpers.logger.LOG_TYPE_ERROR);
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'password not set'
            }, 'checkUserPassword');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/check_password: ' + 'token not found in database: ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database'
                }, 'checkUserPassword');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/check_password: ' + 'user not found in database', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database'
                    }, 'checkUserPassword');
                }

                if (helpers.user.compareCode(password, user.password, user.salt)) {
                    helpers.general.returnResponse(res, {correctPassword: true}, 'checkUserPassword');
                } else {
                    helpers.general.returnResponse(res, {correctPassword: false}, 'checkUserPassword');
                }
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'checkUserPassword');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'checkUserPassword');
            });
    } else {
        helpers.logger.log('/user/check_password: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'checkUserPassword');
    }
}

function updateUserPassword(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const oldPassword = helpers.general.getRequestValue(req, 'oldPassword');
        const newPassword = helpers.general.getRequestValue(req, 'newPassword');

        if (!token) {
            helpers.logger.log('/user/password: token not set', helpers.logger.LOG_TYPE_ERROR);
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'updateUserPassword');
        }
        if (!oldPassword) {
            helpers.logger.log('/user/password: oldPassword not set', helpers.logger.LOG_TYPE_ERROR);
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'oldPassword not set'
            }, 'updateUserPassword');
        }
        if (!newPassword) {
            helpers.logger.log('/user/password: newPassword not set', helpers.logger.LOG_TYPE_ERROR);
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'newPassword not set'
            }, 'updateUserPassword');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/password: ' + 'token not found in database: ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database'
                }, 'updateUserPassword');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/password: ' + 'user not found in database', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database'
                    }, 'updateUserPassword');
                }

                if (helpers.user.compareCode(oldPassword, user.password, user.salt)) {
                    if (user.email) {
                        const transporter = nodemailer.createTransport({
                            host: config.nodemailer.host,
                            port: 587,
                            secure: false,
                            auth: {
                                user: config.nodemailer.user,
                                pass: config.nodemailer.pass
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });

                        const mailOptions = {
                            from: '"universal-server" <universal.server.nodemailer@gmail.com>',
                            to: helpers.general.decrypt(user.email),
                            subject: 'New Password',
                            text: 'Your password has been successfully changed.'
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                helpers.logger.log('/user/password: ' + 'unsuccessful sending message to the user email. ' + error, helpers.logger.LOG_TYPE_ERROR);
                                return helpers.general.returnError(res, {
                                    error: ERROR.GENERAL,
                                    message: 'unsuccessful sending message to the user email'
                                }, 'updateUserPassword');
                            } else {
                                helpers.user.saltHashPassword(newPassword, user);
                                helpers.general.returnResponse(res, {passwordUpdated: true}, 'updateUserPassword');
                            }
                        });
                    } else {
                        helpers.user.saltHashPassword(newPassword, user);
                        helpers.general.returnResponse(res, {passwordUpdated: true}, 'updateUserPassword');
                    }
                } else {
                    helpers.general.returnResponse(res, {passwordUpdated: false}, 'updateUserPassword');
                }
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'updateUserPassword');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'updateUserPassword');
            });
    } else {
        helpers.logger.log('/user/password: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'updateUserPassword');
    }
}

function createUserActivity(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const date = helpers.general.getRequestValue(req, 'date');
        const data = helpers.general.getRequestValue(req, 'data');

        if (!token) {
            helpers.logger.log('/user/activity: token not set', helpers.logger.LOG_TYPE_ERROR, 'createUserActivity');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'createUserActivity');
        }
        if (!date) {
            helpers.logger.log('/user/activity: date not set', helpers.logger.LOG_TYPE_ERROR, 'createUserActivity');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'date not set'
            }, 'createUserActivity');
        }
        if (!data) {
            helpers.logger.log('/user/activity: data not set', helpers.logger.LOG_TYPE_ERROR, 'createUserActivity');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'data not set'
            }, 'createUserActivity');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/activity: ' + 'token not found in database ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database '
                }, 'createUserActivity');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/activity: ' + 'user not found in database ', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database '
                    }, 'createUserActivity');
                }

                Activities.create({userId: user.id, date: date, data: data}).then(function () {
                    Activities.findAll({where: {userId: user.id}}).then(function (activities) {
                        if (!activities) {
                            helpers.logger.log('/user/activities: ' + 'activities not found in database ', helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnResponse(res, {
                                error: ERROR.ACTIVITIES_NOT_FOUND,
                                message: 'activities not found in database '
                            }, 'createUserActivity');
                        }

                        let dateObject = {};
                        for (let i = 0; i < activities.length; i++) {
                            const activityDate = activities[i].date;
                            dateObject[activityDate] = true;
                        }

                        const activityDays = Object.keys(dateObject).length;
                        user.update({activityDays: activityDays}).then(function () {
                            return helpers.general.returnResponse(res, {activityCreated: true}, 'createUserActivity');
                        })
                            .catch(function (error) {
                                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserActivity');
                            });
                    })
                        .catch(function (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserActivity');
                        });
                })
                    .catch(function (error) {
                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserActivity');
                    });
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserActivity');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserActivity');
            });
    } else {
        helpers.logger.log('/user/activity: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'createUserActivity');
    }
}

function getUserActivities(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const startDate = helpers.general.getRequestValue(req, 'startDate');
        const endDate = helpers.general.getRequestValue(req, 'endDate');

        if (!token) {
            helpers.logger.log('/user/activities: token not set', helpers.logger.LOG_TYPE_ERROR, 'getUserActivities');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'getUserActivities');
        }
        if (!startDate) {
            helpers.logger.log('/user/activities: startDate not set', helpers.logger.LOG_TYPE_ERROR, 'getUserActivities');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'startDate not set'
            }, 'getUserActivities');
        }
        if (!endDate) {
            helpers.logger.log('/user/activities: endDate not set', helpers.logger.LOG_TYPE_ERROR, 'getUserActivities');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'endDate not set'
            }, 'getUserActivities');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/activities: ' + 'token not found in database ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database '
                }, 'getUserActivities');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/activities: ' + 'user not found in database ', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database '
                    }, 'getUserActivities');
                }

                if (endDate) {
                    Activities.findAll({where: {userId: user.id}}).then(function (activities) {
                        if (!activities) {
                            helpers.logger.log('/user/activities: ' + 'activities not found in database ', helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnResponse(res, {
                                error: ERROR.ACTIVITIES_NOT_FOUND,
                                message: 'activities not found in database '
                            }, 'getUserActivities');
                        }

                        let dataArray = [];
                        let dataObject = {};

                        for (let i = 0; i < activities.length; i++) {
                            if (activities[i].date >= startDate && activities[i].date <= endDate) {
                                dataObject = JSON.parse(activities[i].data);
                                dataArray.push(dataObject);
                            }
                        }

                        return helpers.general.returnResponse(res, {activities: dataArray}, 'getUserActivities');
                    })
                        .catch(function (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'getUserActivities');
                        });
                } else {
                    Activities.findOne({where: {date: startDate}}).then(function (activities) {
                        if (!activities) {
                            helpers.logger.log('/user/activities: ' + 'activities not found in database ', helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnResponse(res, {
                                error: ERROR.ACTIVITIES_NOT_FOUND,
                                message: 'activities not found in database '
                            }, 'getUserActivities');
                        }

                        let dataArray = [];
                        let dataObject = {};

                        dataObject = JSON.parse(activities.data);
                        dataArray.push(dataObject);

                        return helpers.general.returnResponse(res, {activities: dataArray}, 'getUserActivities');
                    })
                        .catch(function (error) {
                            helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                            return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'getUserActivities');
                        });
                }
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'getUserActivities');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'getUserActivities');
            });
    } else {
        helpers.logger.log('/user/activities: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'getUserActivities');
    }
}

function createUserGameProgress(req, res) {
    if (req.params.api_version === 'v1') {
        const token = helpers.general.getRequestValue(req, 'token');
        const gameId = helpers.general.getRequestValue(req, 'gameId');
        const data = helpers.general.getRequestValue(req, 'data');

        if (!token) {
            helpers.logger.log('/user/game/progress: token not set', helpers.logger.LOG_TYPE_ERROR, 'createUserGameProgress');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'token not set'
            }, 'createUserGameProgress');
        }
        if (!gameId) {
            helpers.logger.log('/user/game/progress: gameId not set', helpers.logger.LOG_TYPE_ERROR, 'createUserGameProgress');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'gameId not set'
            }, 'createUserGameProgress');
        }
        if (!data) {
            helpers.logger.log('/user/game/progress: data not set', helpers.logger.LOG_TYPE_ERROR, 'createUserGameProgress');
            return helpers.general.returnResponse(res, {
                error: ERROR.GENERAL,
                message: 'data not set'
            }, 'createUserGameProgress');
        }

        Token.findOne({where: {token: token}}).then(function (token) {
            if (!token) {
                helpers.logger.log('/user/game/progress: ' + 'token not found in database ' + helpers.general.getRequestValue(req, 'token'), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnResponse(res, {
                    error: ERROR.TOKEN_NOT_FOUND,
                    message: 'token not found in database'
                }, 'createUserGameProgress');
            }

            User.findOne({where: {id: token.userId}}).then(function (user) {
                if (!user) {
                    helpers.logger.log('/user/game/progress: ' + 'user not found in database', helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnResponse(res, {
                        error: ERROR.USER_NOT_FOUND,
                        message: 'user not found in database'
                    }, 'createUserGameProgress');
                }

                UserGames.create({userId: user.id, gameId: gameId, data: data}).then(function () {
                    return helpers.general.returnResponse(res, {added: true}, 'createUserGameProgress');
                })
                    .catch(function (error) {
                        helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                        return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserGameProgress');
                    });
            })
                .catch(function (error) {
                    helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                    return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserGameProgress');
                });
        })
            .catch(function (error) {
                helpers.logger.log(helpers.general.getErrorAsString(error, req), helpers.logger.LOG_TYPE_ERROR);
                return helpers.general.returnError(res, {error: ERROR.GENERAL}, 'createUserGameProgress');
            });
    } else {
        helpers.logger.log('/user/game/progress: version undefined', helpers.logger.LOG_TYPE_ERROR);
        return helpers.general.returnResponse(res, {
            error: ERROR.GENERAL,
            message: 'version undefined'
        }, 'createUserGameProgress');
    }
}

module.exports = {
    signUp,
    signIn,
    logout,
    getUserProfile,
    updateUserProfile,
    createUserSubscription,
    checkUser,
    resetUserPassword,
    checkUserPassword,
    updateUserPassword,
    createUserActivity,
    getUserActivities,
    createUserGameProgress
};
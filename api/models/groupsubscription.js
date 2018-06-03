'use strict';
module.exports = function (sequelize, DataTypes) {
    const GroupSubscription = sequelize.define('GroupSubscription', {}, {
        classMethods: {
            associate: function (models) {
                GroupSubscription.hasMany(models.Subscription, {
                    foreignKey: 'groupSubscriptionId',
                    as: 'subscriptions'
                });
            }
        }
    });
    return GroupSubscription;
};
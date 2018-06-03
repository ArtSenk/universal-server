'use strict';
module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('User', {
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        salt: DataTypes.STRING,
        username: DataTypes.STRING,
        isEmailsAllowed: DataTypes.BOOLEAN,
        subscribedSince: DataTypes.DATE,
        subscribedUntil: DataTypes.DATE,
        activityDays: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function (models) {
                User.hasMany(models.Transaction, {
                    foreignKey: 'userId',
                    as: 'transactions'
                });

                User.hasMany(models.Subscription, {
                    foreignKey: 'userId',
                    as: 'subscriptions'
                });

                User.hasMany(models.Token, {
                    foreignKey: 'userId',
                    as: 'tokens'
                });

                User.hasMany(models.Receipt, {
                    foreignKey: 'userId',
                    as: 'receipts'
                });

                User.hasMany(models.Activities, {
                    foreignKey: 'userId',
                    as: 'activities'
                });
            }
        }
    });
    return User;
};
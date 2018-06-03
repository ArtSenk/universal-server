'use strict';
module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define('User', {
        phone: DataTypes.STRING,
        email: DataTypes.STRING,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        subscribedSince: DataTypes.DATE,
        subscribedUntil: DataTypes.DATE,
        salt: DataTypes.STRING,
        trialDate: DataTypes.DATE,
        firstSubscribedDate: DataTypes.DATE,
        facebookId: DataTypes.BIGINT,
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Transaction, {
                    foreignKey: 'userId',
                    as: 'transactions'
                });

                User.hasMany(models.Subscription, {
                    foreignKey: 'userId',
                    as: 'subscriptions'
                });

                User.hasMany(models.UserGames, {
                    foreignKey: 'userId',
                    as: 'usergames'
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
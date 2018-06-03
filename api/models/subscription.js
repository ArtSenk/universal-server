'use strict';
module.exports = function (sequelize, DataTypes) {
    const Subscription = sequelize.define('Subscription', {
        userId: DataTypes.BIGINT,
        groupSubscriptionId: DataTypes.BIGINT,
        originalTransactionId: DataTypes.STRING,
        transactionId: DataTypes.STRING,
        productId: DataTypes.STRING,
        purchaseDate: DataTypes.DATE,
        expirationDate: DataTypes.DATE,
        isTrial: DataTypes.BOOLEAN
    }, {
        classMethods: {
            associate: function (models) {
                Subscription.hasMany(models.Transaction, {
                    foreignKey: 'subscriptionId',
                    as: 'transactions'
                });

                Subscription.belongsTo(models.GroupSubscription, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });

                Subscription.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Subscription;
};
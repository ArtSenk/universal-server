'use strict';
module.exports = function(sequelize, DataTypes) {
    const Subscription = sequelize.define('Subscription', {
        userId: DataTypes.BIGINT,
        purchaseDate: DataTypes.DATE,
        expirationDate: DataTypes.DATE
    }, {
        classMethods: {
            associate: function(models) {
                Subscription.hasMany(models.Transaction, {
                    foreignKey: 'subscriptionId',
                    as: 'transactions'
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
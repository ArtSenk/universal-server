'use strict';
module.exports = function(sequelize, DataTypes) {
    const Transaction = sequelize.define('Transaction', {
        userId: DataTypes.BIGINT,
        subscriptionId: DataTypes.BIGINT,
        receiptId: DataTypes.BIGINT,
        store: DataTypes.STRING,
        status: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Transaction.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });

                Transaction.belongsTo(models.Subscription, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });

                Transaction.belongsTo(models.Receipt, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Transaction;
};
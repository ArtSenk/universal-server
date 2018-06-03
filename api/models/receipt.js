'use strict';
module.exports = function (sequelize, DataTypes) {
    var Receipt = sequelize.define('Receipt', {
        userId: DataTypes.BIGINT,
        rawReceipt: DataTypes.STRING(1048575),
        store: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Receipt.hasMany(models.Transaction, {
                    foreignKey: 'receiptId',
                    as: 'transactions'
                });

                Receipt.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Receipt;
};
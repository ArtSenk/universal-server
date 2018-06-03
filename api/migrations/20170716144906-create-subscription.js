'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Subscriptions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            userId: {
                type: Sequelize.BIGINT,
                onDelete: "CASCADE",
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            groupSubscriptionId: {
                type: Sequelize.BIGINT,
                onDelete: "CASCADE",
                references: {
                    model: 'GroupSubscriptions',
                    key: 'id'
                }
            },
            originalTransactionId: {
                type: Sequelize.STRING
            },
            transactionId: {
                type: Sequelize.STRING
            },
            productId: {
                type: Sequelize.STRING
            },
            purchaseDate: {
                type: Sequelize.DATE
            },
            expirationDate: {
                type: Sequelize.DATE
            },
            isTrial: {
                type: Sequelize.BOOLEAN
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Subscriptions');
    }
};
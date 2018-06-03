'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Transactions', {
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
            subscriptionId: {
                type: Sequelize.BIGINT,
                onDelete: "CASCADE",
                references: {
                    model: 'Subscriptions',
                    key: 'id'
                }
            },
            receiptId: {
                type: Sequelize.BIGINT,
                onDelete: "CASCADE",
                references: {
                    model: 'Receipts',
                    key: 'id'
                }
            },
            store: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            originalPurchaseDateMs: {
                type: Sequelize.STRING
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
        return queryInterface.dropTable('Transactions');
    }
};
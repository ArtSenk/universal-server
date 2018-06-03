'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('Activities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.BIGINT,
                onDelete: "CASCADE",
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            date: {
                type: Sequelize.STRING
            },
            data: {
                type: Sequelize.STRING(1024)
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
        return queryInterface.dropTable('Activities');
    }
};
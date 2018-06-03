'use strict';
module.exports = function(sequelize, DataTypes) {
    var Activities = sequelize.define('Activities', {
        userId: DataTypes.BIGINT,
        date: DataTypes.STRING,
        data: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Activities.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Activities;
};
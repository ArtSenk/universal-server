'use strict';
module.exports = function (sequelize, DataTypes) {
    const Token = sequelize.define('Token', {
        userId: DataTypes.BIGINT,
        token: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Token.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Token;
};
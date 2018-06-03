'use strict';
module.exports = function(sequelize, DataTypes) {
    var UserGames = sequelize.define('UserGames', {
        userId: DataTypes.BIGINT,
        gameId: DataTypes.STRING,
        data: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                UserGames.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return UserGames;
};
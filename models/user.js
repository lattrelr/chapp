const User = (sequelize, Sequelize) => {
    return sequelize.define("user", {
        id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
        },
        displayname: {
            type: Sequelize.STRING,
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        hash: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    });
}

module.exports = User

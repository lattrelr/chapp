const Friend = (sequelize, Sequelize) => {
    return sequelize.define("friend", {
        user1: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        user2: {
            type: Sequelize.UUID,
            allowNull: false,
        },
    });
}

module.exports = Friend
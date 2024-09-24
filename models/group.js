const Group = (sequelize, Sequelize) => {
    return sequelize.define("group", {
        id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
        },
        displayname: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
    });
}

module.exports = Group

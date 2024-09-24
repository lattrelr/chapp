const MsgKey = (sequelize, Sequelize) => {
    return sequelize.define("msgkey", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        type: {
            type: Sequelize.STRING,
        },
    });
}

module.exports = MsgKey
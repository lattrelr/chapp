const GroupMember = (sequelize, Sequelize) => {
    return sequelize.define("groupmember", {
        group: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        user: {
            type: Sequelize.UUID,
            allowNull: false,
        },
    });
}

module.exports = GroupMember
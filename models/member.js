const Member = (sequelize, Sequelize) => {
    return sequelize.define("member", {
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

module.exports = Member

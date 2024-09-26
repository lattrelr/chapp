const dbConfig = require("../db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.msgkeys = require("./msgkey")(sequelize, Sequelize);
db.users = require("./user")(sequelize, Sequelize);
db.groups = require("./group")(sequelize, Sequelize);
db.members = require("./member")(sequelize, Sequelize);
db.friends = require("./friend")(sequelize, Sequelize);

module.exports = db;

module.exports = {
    HOST: "localhost",
    USER: "chapp",
    PASSWORD: "chapp",
    DB: "chapp",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};

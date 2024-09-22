const express = require("express");
const cookieParser = require('cookie-parser');
// TODO use these
const { query, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");

const app = express();
const port = 3000;

const notifySocket = require("./websockets/socket");
const messagesRouter = require("./routes/messages");
const usersRouter = require("./routes/users");
const sessionsRouter = require("./routes/sessions");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use("/api/messages", messagesRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);

app.use((req, res, next) => {
    res.send("ERROR");
});

const db = require("./models");
db.sequelize.sync({ force: true })
  .then(() => {
    console.log("Dropped and synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const server = app.listen(port, () => {
    console.log(`Started app on port ${port}`);
});

notifySocket.start(server);

module.exports = app;

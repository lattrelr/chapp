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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use("/api/messages", messagesRouter);
app.use("/api/users", usersRouter);

app.use((req, res, next) => {
    res.send("ERROR");
});

const server = app.listen(port, () => {
    console.log(`Started app on port ${port}`);
});

notifySocket.start(server);

module.exports = app;

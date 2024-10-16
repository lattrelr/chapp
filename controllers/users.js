const bcrypt = require ('bcrypt');
const db = require("../models");
const notifySocket = require("../websockets/socket");
const controller = {};

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) resolve("")
            resolve(hash);
        });
    });
}

async function addUser(key, req, res) {
    const hashedpw = await hashPassword(req.body.password);

    let displayName = req.body.displayname
    if (displayName == undefined) {
        displayName = req.body.username
    }

    const newUser = {
        id: key,
        displayname: displayName,
        username: req.body.username,
        hash: hashedpw
    }

    db.users.create(newUser)
        .then(data => {
            console.log(`Created user ${data.id}`);
            res.send({
                message: "User created OK"
            });
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the user."
            });
        });
}

async function checkForUsername(req) {
    exists = await db.users.findOne({
        where: {
            "username": req.body.username,
        }
    });
    if (exists == null) {
        return false;
    }
    return true;
}

controller.createUser = async (req, res) => {
    // TODO delete msgKey ?  We might want group to be a message type instead.

    if (await checkForUsername(req)) {
        return res.status(500).send({
            message:
                "Username already exists!"
        });
    }

    // To make the user first we create a key in the msgkey database,
    // this is used as the PK for the user, and also the GUID that
    // the user will be referenced by in the token, and message
    // routing.

    // We want a list of msgkeys that are unique so we can use them for
    // both single user and group messages.
    const msgKey = {
        type: "user"
    }

    db.msgkeys.create(msgKey)
        .then(data => {
            console.log(`Created key ${data.id}`);
            addUser(data.id, req, res);
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the key."
            });
        });
};

controller.getUsers = async (req, res) => {
    // TODO add where and get params to give less to the client if they want just an ID
    db.users.findAll({attributes: ['id', 'username', 'displayname']})
        .then(data => {
            // Add "online" attribute based on current socket data
            // TODO limit this to friends or groups or paged users.
            const onlineUsers = notifySocket.getOnlineUsers()
            data = data.map ( u => {
                    u = u.toJSON()
                    u.online = onlineUsers.has(u.id)
                    return u
                }
            )
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        });
}

controller.getUser = async (req, res) => {
    // TODO add where and get params to give less to the client if they want just an ID
    db.users.findByPk(req.params.id, {attributes: ['id', 'username', 'displayname']})
        .then(data => {
            const onlineUsers = notifySocket.getOnlineUsers()
            let u = data.toJSON()
            u.online = onlineUsers.has(u.id)
            res.send(u);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving user."
            });
        });
}

module.exports = controller;

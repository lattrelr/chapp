const bcrypt = require ('bcrypt');
const db = require("../models");
const controller = {};

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) resolve("")
            resolve(hash);
        });
    });
}

controller.createUser = async (req, res) => {
    const hashedpw = await hashPassword(req.body.password);

    const newUser = {
        displayname: req.body.username,
        username: req.body.username,
        hash: hashedpw
    }

    db.users.create(newUser)
        .then(data => {
            console.log(`Created user ${data.id}`);
            res.send({
                message: "User create OK"
            });
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the user."
            });
        });
};

controller.getUsers = async (req, res) => {
    // TODO add where and get params to give less to the client if they want just an ID
    db.users.findAll({attributes: ['id', 'displayname']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
}

controller.getUser = async (req, res) => {
    // TODO add where and get params to give less to the client if they want just an ID
    db.users.findByPk(req.params.id, {attributes: ['id', 'displayname']})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
}

module.exports = controller;

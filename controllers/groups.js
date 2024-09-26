const db = require("../models");
const { Op, QueryTypes } = require('sequelize');
const controller = {};

async function addGroup(key, req, res) {
    // TODO take list of user GUIDS to add to the group
    // on creation
    const newGroup = {
        id: key,
        displayname: req.body.displayname,
        description: req.body.description,
        createdby: req.body.createdby
    }

    db.groups.create(newGroup)
        .then(data => {
            console.log(`Created group ${data.id}`);
            res.send({
                message: "Group created OK"
            });
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the group."
            });
        });
}

controller.createGroup = async (req, res) => {
    // To make the group first we create a key in the msgkey database,
    // this is used as the PK for the group, and also the GUID that
    // the group will be referenced by in message routing.

    // We want a list of msgkeys that are unique so we can use them for
    // both single user and group messages.
    const msgKey = {
        type: "group"
    }

    db.msgkeys.create(msgKey)
        .then(data => {
            console.log(`Created key ${data.id}`);
            addGroup(data.id, req, res);
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the key."
            });
        });
};

controller.getGroups = async (req, res) => {
    const owner = req.query.createdby;
    const member = req.query.member;
    if (owner != undefined) {
        db.groups.findAll({ where: { "createdby": owner }})
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving groups."
                });
            });
    } else if (member != undefined)  {
        const rawQuery =
            `SELECT groups.id, groups.displayname, groups.description, groups.createdby
            FROM members
            INNER JOIN groups ON members.group=groups.id
            WHERE members.user='${member}';`
        db.sequelize.query(rawQuery, {
            type: QueryTypes.SELECT,
        }).then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving groups."
            });
        });
    } else {
        db.groups.findAll()
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving groups."
                });
            });
    }
}

controller.getGroup = async (req, res) => {
    // TODO add where and get params to give less to the client if they want just an ID
    db.groups.findByPk(req.params.id, {})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving group."
            });
        });
}

module.exports = controller;

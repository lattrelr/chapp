const db = require("../models");
const { Op, QueryTypes } = require('sequelize');
const { validationResult } = require("express-validator");
const controller = {};

async function checkForExisting(req, res) {
    connection = await db.members.findOne({
        where: {
            "group": req.body.group,
            "user": req.body.user
        }
    });
    if (connection == null) {
        return false;
    }
    return true;
}

controller.createMember = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const member = {
        group: req.body.group,
        user: req.body.user
    }

    // Prevent duplicates
    if (await checkForExisting(req,res)) {
        // TODO check error message number
        return res.status(500).send({
            message: "Already a member!"
        });
    }

    db.members.create(member)
        .then(data => {
            console.log(`${data.group} has member ${data.member}`);
            res.send({
                message: "Member added OK"
            });
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while adding a member."
            });
        });
};

controller.deleteMember = async (req, res) => {
    const group = req.params.groupid;
    const user = req.params.memberid;

    db.members.destroy({
        where: {
            "group": req.body.group,
            "user": req.body.user
        }
    }).then(num => {
        res.send({
            message: `Removed ${num} member(s)`
        });
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing members."
        });
    });
}

controller.getAllMembers = async (req, res) => {
    db.members.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving members."
            });
        });
}

// TODO join on users table...
controller.getMembers = async (req, res) => {
    const group = req.params.id
    db.members.findAll({ where: { "group": group } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving members."
            });
        });
}

module.exports = controller;
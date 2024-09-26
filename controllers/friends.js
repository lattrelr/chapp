const db = require("../models");
const { Op, QueryTypes } = require('sequelize');
const { validationResult } = require("express-validator");
const controller = {};

async function checkForExisting(req, res) {
    connection = await db.friends.findOne({
        where: {
            [Op.or] : [{
                "user1": req.body.user1,
                "user2": req.body.user2
            }, {
                "user1": req.body.user2,
                "user2": req.body.user1
            }]
        }
    });
    if (connection == null) {
        return false;
    }
    return true;
}

controller.createFriend = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const friend = {
        user1: req.body.user1,
        user2: req.body.user2
    }

    // Prevent duplicates
    if (await checkForExisting(req,res)) {
        // TODO check error message number
        return res.status(500).send({
            message: "Already friended!"
        });
    }

    db.friends.create(friend)
        .then(data => {
            console.log(`${data.user1} friended ${data.user2}`);
            res.send({
                message: "Friend created OK"
            });
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while adding a friend."
            });
        });
};

controller.deleteFriend = async (req, res) => {
    const myid = req.params.myid;
    const friendid = req.params.friendid;

    db.friends.destroy({
        where: {
            [Op.or] : [{
                "user1": myid,
                "user2": friendid
            }, {
                "user1": friendid,
                "user2": myid
            }]
        }
    }).then(num => {
        res.send({
            message: `Removed ${num} friend(s)`
        });
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing friends."
        });
    });
}

controller.getAllFriends = async (req, res) => {
    db.friends.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving friends."
            });
        });
}

controller.getFriends = async (req, res) => {
    // This query will get you the {id,displayname} of the friends
    // belonging to the :id parameter passed in.  We have to consider
    // the friends db is set as {user1, user2} and the :id passed in
    // could be in either position.  Therefore we need to join with the
    // friends table, and union with both possibilities.
    const myId = req.params.id
    const rawQuery =
        `SELECT user1 as id,displayname
         FROM friends
         INNER JOIN users ON friends.user1=users.id
         WHERE user2='${myId}'
         UNION ALL
         SELECT user2 as id,displayname
         FROM friends
         INNER JOIN users ON friends.user2=users.id
         WHERE user1='${myId}';`

    db.sequelize.query(rawQuery, {
        type: QueryTypes.SELECT,
    }).then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving friends."
        });
    });
}

module.exports = controller;
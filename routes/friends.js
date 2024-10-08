const express = require("express");
const { body } = require('express-validator');
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/friends");

// TODO for testing no token needed
router.post("/",
    [
    body('user1').notEmpty(),
    body('user2').notEmpty()
    ],
    controller.createFriend
);
router.get("/:id", controller.getFriends);
router.delete("/:myid/:friendid", controller.deleteFriend);
// TODO debug route only; this info is mostly meaningless.
router.get("/", controller.getAllFriends);

module.exports = router;

const express = require("express");
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/messages");

// TODO limit to owner token only!

// Options
// will only return messages for owner of token for :id
// use with=UUID2 to isolate conversation
// /messages/UUID1?with=UUID2
router.get("/:id", controller.getMessages);
//router.get("/:id", authjwt.verifyToken, controller.getMessages);

module.exports = router;

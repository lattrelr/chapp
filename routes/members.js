const express = require("express");
const { body } = require('express-validator');
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/members");

// TODO for testing no token needed
router.post("/",
    [
    body('group').notEmpty(),
    body('user').notEmpty()
    ],
    controller.createMember
);
router.get("/:id", controller.getMembers);
router.delete("/:groupid/:memberid", controller.deleteMember);
// TODO debug route only; this info is mostly meaningless.
router.get("/", controller.getAllMembers);

module.exports = router;

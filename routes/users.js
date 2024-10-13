const express = require("express");
const { body } = require('express-validator');
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/users");

router.post("/",
    [
    body('username').notEmpty(),
    body('password').notEmpty()
    ],
    controller.createUser
);

router.get("/", controller.getUsers);
router.get("/:id", controller.getUser);
// TODO for testing no token needed
//router.get("/", authjwt.verifyToken, controller.getUsers);

// TODO route to delete user

module.exports = router;

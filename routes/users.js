const express = require("express");
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/users");

router.post("/", controller.createUser);
router.get("/", controller.getUsers);
// TODO for testing no token needed
//router.get("/", authjwt.verifyToken, controller.getUsers);

module.exports = router;

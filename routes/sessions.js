const express = require("express");
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/sessions");

router.post("/login", controller.login);
router.get("/active", authjwt.verifyToken, controller.active);
router.get("/logout", controller.logout);

module.exports = router;

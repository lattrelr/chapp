const express = require("express");
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/groups");

router.post("/", controller.createGroup);
router.get("/", controller.getGroups);
// Query options are
// Groups I created - createdby:
// Groups I'm a member of - member:
router.get("/:id", controller.getGroup);

// TODO for testing no token needed
//router.get("/", authjwt.verifyToken, controller.getGroups);

// TODO route to delete group
//router.delete("/:id", controller.deleteGroup);

module.exports = router;

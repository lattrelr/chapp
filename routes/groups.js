const express = require("express");
const authjwt = require("../middleware/authjwt");
const router = express.Router();

const controller = require("../controllers/groups");

router.post("/", controller.createGroup);
router.get("/", controller.getGroups);
router.get("/:id", controller.getGroup);
// TODO for testing no token needed
//router.get("/", authjwt.verifyToken, controller.getGroups);

// TODO route to add group member... put?
// can be used to add members, update desciption, update display name.
//router.put("/:id", controller.update);
// TODO route to delete group member
//router.delete("/:groupid/:userid", controller.deleteGroupMember);
// TODO route to delete group
//router.delete("/:id", controller.deleteGroup);

module.exports = router;

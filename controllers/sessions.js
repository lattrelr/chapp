const bcrypt = require ('bcrypt');
const authjwt = require ('../middleware/authjwt');
const db = require("../models");
const controller = {};

controller.login = async (req, res) => {
    const user = await db.users.findOne({where:{username: req.body.username}});
    if (user != null) {
        if (bcrypt.compareSync(req.body.password, user.hash)) {
            const token = authjwt.createToken(user.id.toString());

            // Create cookie with the token
            let options = {
                maxAge: 60 * 60 * 1000, // would expire in 60 minutes
                httpOnly: true, // The cookie is only accessible by the web server
                // STOPSHIP FIXME: This should be true, but we are not https.
                secure: false,
                sameSite: "Strict",
            };
        
            res.cookie("SessionID", token, options);

            // Return the token via json to use as auth as option
            return res.status(200).json({
                "token": token,
            });
        }
    }

    return res.status(401).json({
        status: "failed",
        message: "Invalid username or password.",
    });
};

controller.active = async (req, res) => {
    const user = req.userId;
    if (user != null) {
        return res.status(200).json({
            username: user
        });
    }

    return res.status(401).json({
        message: "Invalid username or password.",
    });
}

controller.logout = (req, res) => {
    res.clearCookie("SessionID");
    return res.status(200).json({
        message: "Logged out"
    });
}

module.exports = controller;

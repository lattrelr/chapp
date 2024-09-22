const bcrypt = require ('bcrypt');
const authjwt = require ('../middleware/authjwt');
const controller = {};

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) resolve("")
            resolve(hash);
        });
    });
}

controller.login = async (req, res) => {
    console.log(`Creating token for ${req.body.username}`)
    const user = req.body.username;
    if (user != null) {
        return res.status(200).json({
            token: authjwt.createToken(user.toString()),
        });
    }

    return res.status(401).json({
        status: "failed",
        message: "Invalid username or password.",
    });
};

controller.getActiveUser = async (req, res) => {
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

module.exports = controller;

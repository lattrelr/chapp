const jwt = require("jsonwebtoken");
const authjwt = {};
// TODO store in env
const privateKey = "1cd83fa16555147ab7f4923937107f57b609cb47";

function decodeToken(token, header) {
    let decoded = null

    if (typeof header !== 'undefined') {
        const bearer = header.split(' ');
        token = bearer[1];
    }

    try {
        decoded = jwt.verify(token, privateKey);
    } catch(err) {
        console.log("Error decoding token!");
    }

    return decoded;
}

function parseCookie(str) {
    if (str == undefined)
        return {}

    return str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
            if (v[0] != undefined && v[1] != undefined)
                acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {});
}

authjwt.verifyTokenWs = (request) => {
    cookies = parseCookie(request.headers['cookie'])
    const header = request.headers['authorization']
    const token = cookies["SessionID"];

    decoded = decodeToken(token, header);
    if (decoded == null) {
        return null
    }
    return decoded.id
}

authjwt.verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = req.cookies["SessionID"];

    decoded = decodeToken(token, header);
    if (decoded == null) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    } else {
        req.userId = decoded.id;
        console.log("Verified user " + decoded.id);
        next()
    }
};

authjwt.createToken = (userId) => {
    const token = jwt.sign(
        { id: userId },
        privateKey,
        { expiresIn: 86400 } // 24 hours
    );
    return token;
}

module.exports = authjwt;

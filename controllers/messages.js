const Message = require('../models/message');
const controller = {};

// TODO limit to owner token only!
// match id provided by token with request before searching.

controller.getMessages = async (req, res) => {
    const owner = req.params.id;
    const partner = req.query.with;
    if (partner == undefined) {
        const messages = await Message.find({
            "$or": [{
                "from": owner,
            }, {
                "to": owner,
            }]
        });
        res.json(messages);
    } else {
        await getConversation(owner, partner, req, res);
    }
}

async function getConversation(owner, partner, req, res) {
    const after = req.query.after;
    let messages = {}
    if (after == undefined) {
        messages = await Message.find({
            "$or": [{
                "from": owner,
                "to": partner
            }, {
                "to": owner,
                "from": partner
            }]
        });
    } else {
        messages = await Message.find({
            "$and": [
                {
                    "$or": [{
                        "from": owner,
                        "to": partner
                    }, {
                        "to": owner,
                        "from": partner
                    }]
                },
                {
                    "date": {$gte: after}
                }
            ]
        });
    }
    
    res.json(messages);
}

module.exports = controller;

const textMessage = {}
const Message = require('../models/message');

textMessage.getTo = (msg)  => {
    toUser = null
    msg_json = JSON.parse(msg)
    if (msg_json["to"] != undefined) {
        toUser = msg_json["to"];
    }
    return toUser
}

textMessage.getFrom = (msg)  => {
    fromUser = null
    msg_json = JSON.parse(msg)
    if (msg_json["from"] != undefined) {
        fromUser = msg_json["from"];
    }
    return fromUser
}

textMessage.persist = (msg) => {
    msg_json = JSON.parse(msg)
    Message.create({ 
        from: msg_json["from"],
        to: msg_json["to"],
        text: msg_json["text"],
    }).then(() => {
        console.log("Message saved.");
    }).catch((err) => {
        console.log("Message did not save! " + err);
    });
}

module.exports = textMessage;

const textMessage = {}

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

module.exports = textMessage;

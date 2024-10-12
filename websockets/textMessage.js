const textMessage = {}
const Message = require('../models/message');

// TODO fix all these so they aren't dumb, why are we returning a msg? Can't we
// just modify the object given?

textMessage.setTo = (msg, toUser)  => {
    msg_json = JSON.parse(msg)
    msg_json["to"] = toUser;
    return JSON.stringify(msg_json)
}

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

// TODO maybe add FROM_DISPLAYNAME so client doesn't need to find it
// on first message.  Might reduce server load.

textMessage.setFrom = (msg, fromUser)  => {
    msg_json = JSON.parse(msg)
    msg_json["from"] = fromUser;
    return JSON.stringify(msg_json)
}

textMessage.setId = (msg, msgid)  => {
    msg_json = JSON.parse(msg)
    msg_json["_id"] = msgid;
    return JSON.stringify(msg_json)
}

textMessage.setDate = (msg, date)  => {
    msg_json = JSON.parse(msg)
    msg_json["date"] = date;
    return JSON.stringify(msg_json)
}

textMessage.persist = async (msg) => {
    msg_json = JSON.parse(msg)

    newMsg = {
        from: msg_json["from"],
        to: msg_json["to"],
        text: msg_json["text"],
    }

    let res = null
    try {
        res = await Message.create(newMsg)
        console.log("Message saved.");
    } catch (err)  {
        console.log("Message did not save! " + err);
        throw err
    };

    //console.log(`${res}`)
    //console.log(`${new Date(res.date).valueOf() }`)
    return res
}

module.exports = textMessage;

const statusMessage = {}

statusMessage.get = (user, status)  => {
    msg = {
        "type": "status",
        "who": user,
        "status": status
    }
    return JSON.stringify(msg)
}

statusMessage.ONLINE = "ONLINE"
statusMessage.OFFLINE = "OFFLINE"
statusMessage.AWAY = "OFFLINE"

module.exports = statusMessage;

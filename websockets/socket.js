const socket = {};
const WebSocketServer = require('ws').Server
const authjwt = require ('../middleware/authjwt');
const statusMessage = require ('./statusMessage');
const textMessage = require ('./textMessage');
const db = require("../models");
let ws = null
const clientMap = new Map();

socket.start = (server) => {
    server.on('upgrade', onUpgrade);

    ws = new WebSocketServer({ noServer: true })
    ws.on('connection', handleNew);
    
    console.log(`Started ws server`);
}

socket.getOnlineUsers = () => {
    // TODO maintain this with add/remove map.  No reason to create on every call here
    let online = new Set()
    for (const u of clientMap.keys()) {
        online.add(u)
    }
    return online
}

function onUpgrade(request, socket, head) {
    userId = authjwt.verifyTokenWs(request)
    if (userId == null) {
        console.log(`Token not valid for web socket start`)
        socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii") 
    } else {
        ws.handleUpgrade(request, socket, head, function done(socket) {
            socket.userId = userId;
            ws.emit('connection', socket);
        });
    }
}

function addToClientMap(socket) {
    if (clientMap.get(socket.userId) == undefined) {
        clientMap.set(socket.userId, [socket])
        setStatus(socket.userId, statusMessage.ONLINE);
    } else {
        clientMap.get(socket.userId).push(socket)
    }
}

function removeFromClientMap(socket) {
    let arr = clientMap.get(socket.userId)
    if (clientMap.get(socket.userId) != undefined) {
        arr = arr.filter(item =>
            item != socket
        )
        if (arr.length) {
            clientMap.set(socket.userId, arr)
        } else {
            clientMap.delete(socket.userId)
            setStatus(socket.userId, statusMessage.OFFLINE);
        }
    }
}

function handleNew(socket) {
    console.log(`A connection started for user ${socket.userId}`)
    addToClientMap(socket)

    socket.on('message', msg => {
        handleMessage(socket, msg)
    })

    socket.on('close', () => {
        console.log(`A connection ended for ${socket.userId}`)
        removeFromClientMap(socket)
    })
}

function handleMessage(socket, msg) {
    // Set the user this came from
    msg = textMessage.setFrom(msg, socket.userId)
    // TODO not sure how well it scales to wait for writes before sending?
    // Store the mssage in the DB
    textMessage.persist(msg).then(res => {
        // Populate with id from db
        msg = textMessage.setId(msg, res._id.toString())
        msg = textMessage.setDate(msg, new Date(res.date).valueOf())
        sendMessage(msg)
    }).catch(err => {
        // TODO tbd
    })
}

function sendMessage(msg) {
    // TODO handle group messages by tagging them as "group" by the client first.
    // the client will know if it is a group or a user.  Delete msgkeys table!
    // TODO validate
    // TODO do some sort of ACK and or read receipt/delivered
    // TODO some sort of NACK if user doesn't exist.

    console.log(`[MSG] ${msg}`)

    // check for group
    if (true) {
        sendDirectMessage(msg)
    } else {
        sendGroupMessage(msg)
    }
}

function setStatus(user, status) {
    msg = statusMessage.get(user, status)
    // TODO only send to friends or other group members...
    broadcastMessage(msg)
}

function sendDirectMessage(msg) {
    const toUser = textMessage.getTo(msg)
    const fromUser = textMessage.getFrom(msg)

    console.log(`[DM] From ${textMessage.getFrom(msg)} to ${textMessage.getTo(msg)}`)

    if (toUser != null) {
        sendToUser(toUser, msg)
    }

    if (fromUser != null) {
        sendToUser(fromUser, msg)
    }
}

function sendToUser(userId, msg) {
    const sockets = clientMap.get(userId)
    if (sockets != undefined) {
        for (const socket of sockets) {
            socket.send(msg)
        }
    }
}

function sendGroupMessage(msg) {
    // TODO find a way to cache X number of groups so we don't have to keep looking up
    // who the members are. -- Need to invalidate if members changed!!
    groupId = textMessage.getTo(msg)

    // IF NOT IN CACHE:
    db.members.findAll({ where: { "group": groupId } })
        .then(data => {
            data.forEach(member => {
                let toSocket = clientMap.get(member.user)
                if (toSocket != undefined) {
                    console.log(`[Group] From group ${groupId} to user ${member.user}`)
                    toSocket.send(msg)
                } else {
                    console.log(`[Group] WebSocket for ${member.user} not found!`)
                }
            })
        })
        .catch(err => {
            console.log(`Error getting members of ${groupId}`)
        });
}

function broadcastMessage(msg) {
    ws.clients.forEach(client => {
        client.send(msg)
    })
}

module.exports = socket;

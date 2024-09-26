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

async function onUpgrade(request, socket, head) {
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

function handleNew(socket) {
    console.log(`New connection for user ${socket.userId}`)
    setStatus(socket.userId, statusMessage.ONLINE);
    clientMap.set(socket.userId, socket)

    socket.on('message', msg => {
        // Set the user this came from
        msg = textMessage.setFrom(msg, socket.userId)
        // Store the mssage in the DB
        textMessage.persist(msg)
        // Send out
        handleMessage(socket, msg)
    })

    socket.on('close', () => {
        handleClose(socket)
    })
}

function handleMessage(socket, msg) {
    // TODO handle group messages by tagging them as "group" by the client first.
    // the client will know if it is a group or a user.
    // TODO validate
    // TODO do some sort of ACK and or read receipt
    let toUser = textMessage.getTo(msg)
    if (toUser != null) {
        let toSocket = clientMap.get(toUser)
        if (toSocket != undefined) {
            directMessage(socket, toSocket, msg)
        } else {
            // TODO tag message as group by the client to avoid unwanted lookups.
            //console.log(`[DM] WebSocket for ${toUser} not found!`)
            // Try a group message if user DNE
            // TODO we can use msgkeys someway or another...maybe faster to check that quick.
            sendGroupMessage(toUser, msg)
        }
    }
}

function setStatus(user, status) {
    msg = statusMessage.get(user, status)
    // TODO only send to friends or other group members...
    broadcastMessage(msg)
}

function handleClose(socket) {
    console.log(`WebSocket was closed for ${socket.userId}`)
    setStatus(socket.userId, statusMessage.OFFLINE);
    clientMap.delete(socket.userId)
}

function directMessage(fromSocket, toSocket, msg) {
    console.log(`From ${textMessage.getFrom(msg)} to ${textMessage.getTo(msg)}`)
    fromSocket.send(msg)
    toSocket.send(msg)
}

function sendGroupMessage(groupId, msg) {
    // TODO find a way to cache X number of groups so we don't have to keep looking up
    // who the members are. -- Need to invalidate if members changed!!

    // IF NOT IN CACHE:

    // TODO: FIXME: This isn't working...but the query works manually.
    db.members.findAll({ where: { "group": groupId } })
        .then(data => {
            members.forEach(member => {
                let toSocket = clientMap.get(member.user)
                if (toSocket != undefined) {
                    directMessage(socket, toSocket, msg)
                } else {
                    console.log(`[Group] WebSocket for ${toUser} not found!`)
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

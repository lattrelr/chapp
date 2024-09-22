const socket = {};
const WebSocketServer = require('ws').Server
const authjwt = require ('../middleware/authjwt');
const statusMessage = require ('./statusMessage');
const textMessage = require ('./textMessage');
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
        handleMessage(socket, msg)
    })

    socket.on('close', () => {
        handleClose(socket)
    })
}

function handleMessage(socket, msg) {
    // TODO validate
    // TODO do some sort of ACK and or read receipt
    let toUser = textMessage.getTo(msg)
    if (toUser != null) {
        let toSocket = clientMap.get(toUser)
        if (toSocket != undefined) {
            directMessage(socket, toSocket, msg)
        }
    } else {
        broadcastMessage(msg)
    }
}

function setStatus(user, status) {
    msg = statusMessage.get(user, status)
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

function broadcastMessage(msg) {
    ws.clients.forEach(client => {
        client.send(msg)
    })
}

module.exports = socket;

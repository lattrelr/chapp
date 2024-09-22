const socket = {};
const WebSocketServer = require('ws').Server
const authjwt = require ('../middleware/authjwt');
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
    setStatus(socket.userId, "ONLINE");
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
    msg_json = JSON.parse(msg)
    if (msg_json["to"] != undefined) {
        let toSocket = clientMap.get(msg_json["to"])
        if (toSocket != undefined) {
            directMessage(socket, toSocket, msg)
        }
    } else {
        broadcastMessage(msg)
    }
}

function setStatus(user, status) {
    msg = {
        "type": "status",
        "who": user,
        "status": status
    }
    broadcastMessage(JSON.stringify(msg))
}

function handleClose(socket) {
    console.log(`WebSocket was closed for ${socket.userId}`)
    setStatus(socket.userId, "OFFLINE");
    clientMap.delete(socket.userId)
}

function directMessage(fromSocket, toSocket, msg) {
    console.log(`From ${fromSocket.userId} to ${toSocket.userId}`)
    fromSocket.send(msg)
    toSocket.send(msg)
}

function broadcastMessage(msg) {
    ws.clients.forEach(client => {
        client.send(msg)
    })
}

module.exports = socket;

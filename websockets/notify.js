const socket = {};
const WebSocketServer = require('ws').Server
const authjwt = require ('../middleware/authjwt');
let ws = null

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

    socket.on('message', msg => {
        handleMessage(socket, msg)
    })

    socket.on('close', () => {
        handleClose(socket)
    })
}

function handleMessage(socket, msg) {
    ws.clients.forEach(client => {
        if (client != socket)
            client.send(msg)
    })
}

function handleClose(socket) {
    console.log(`WebSocket was closed for ${socket.userId}`)
}

module.exports = socket;

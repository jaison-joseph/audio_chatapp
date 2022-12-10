const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
// socket io mounts on top of node's http server?
const io = new Server(server);

app.get('/', (req, res) => {
    // console.log("got a request");
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket) => {
    console.log("A user connected");
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
        console.log('message: ' + msg);
    });
});

io.on('connection', (socket) => {
    socket.on('audio message', (msg) => {
        socket.broadcast.emit('audio message', msg);
        console.log('got an audio message');
    });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
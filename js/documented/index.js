const express = require('express');
const app = express();
// expose the public/ directory, which contains the front-end html & css
app.use(express.static(__dirname + '/public'));
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// socket io mounts on top of node's http server?
const io = new Server(server);

const db_ = require("@replit/database");
const db = new db_();

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/name.html");
});

// for debugging; a call to this route will list the keys and values on the store on the server
app.get('/values', (req, res) => {
    db.list().then(keys => {
        keys.forEach((k) => {
            db.get(k).then(v => {
                console.log(k + ": " + v);
            });
        });
    });
});

// for debugging: a call to this route will clear all key:value pairs
app.get('/deleteKeys', (req, res) => {
    db.list().then(keys => {
        keys.forEach((k) => {
            console.log("deleting key: ", k);
            db.delete(k);
        });
        console.log("all keys deleted");
    });
});

// serve the public/index.html page on the /chat route
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// serve the public/name.html page on the /start route, this is the route where the user is supposed to start
app.get('/start', (req, res) => {
    res.sendFile(__dirname + "/public/name.html");
});

// for debugging, console logs the username of ever disconnecting socket
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('user disconnected: ', socket.id);
    });
});

// allows the quit button to 'give up' the name of the current user's socket
io.on('connection', (socket) => {
    socket.on('quit', () => {
        // flag to stop iterations once the value is found
        let gotEntry = false;
        db.list().then(keys => {
            keys.forEach((k) => {
                // will only check if the value still isn't found
                if (!gotEntry) {
                    db.get(k).then(v => {
                        if (v ==  socket.id) {
                            console.log("deleting key of user: ", k);
                            db.delete(k);
                            gotEntry = true;
                        }
                    });
                }
            });
        });
    });
});

// for debugging; console log on every new socket connection
io.on('connection', (socket) => {
    console.log("A user connected: ", socket.id);
});

// upon receiving an audio message, emit the same to everyone except the sender
io.on('connection', (socket) => {
    socket.on('audio message', (msg) => {
        socket.broadcast.emit('audio message', msg);
        console.log('got an audio message');
    });
});

// checks to see if the key value store has an entry with the key passed along with the event
io.on('connection', (socket) => {
    socket.on('checkUniqueName', async function(msg) {
        console.log('got an name check request for: ', msg);
        let val = await db.get(msg);
        console.log(val);
        console.log("comparison: ", val == null);
        if (val == null) {
            /** 
            create an entry in the replit db as:
                username:socketid
            create an entry in localStorage of the client as 
                "username": username
            redirect to the chat app
            use the entry in client's local storage to get the username
            update the value in replit db's username:socketid value 
            when the user disconnects, delete the username:socketid key
            */
            await db.set(msg, socket.id);
            socket.emit('checkUniqueNameResponse', 'noice');
            socket.disconnect();
        }
        else {
            socket.emit('checkUniqueNameResponse', 'exists');
        }
    });
});

// used every time the chat page loads, checks the kv store for a username:socketId
// entry, if found, the value is updated with the sender's socketId. 
// a 'updateSocketIdResponse' event is emitted with the result of the event
io.on('connection', (socket) => {
    socket.on('updateSocketId', async function(clientInfo) {
        const username = clientInfo["username"];
        const socketId = clientInfo["socketId"];
        console.log('got a socket id update request for: ', username);
        let storedSocketId = await db.get(username);
        if (socketId == storedSocketId) {
            await db.set(username, socket.id);
            let newSocketId = await db.get(username);
            console.log("socketId for: " + username + " set to: ", newSocketId);
            socket.emit('updateSocketIdResponse', 'success');
        }
        else {
            console.log("different socketIds for: ", socketId);
            socket.emit('updateSocketIdResponse', 'impostor!');
        }
    });
});

// start server
server.listen(3000, () => {
    console.log('listening on *:3000');
});
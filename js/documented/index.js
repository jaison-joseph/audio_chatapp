const express = require('express');
// var session = require('express-session');
const app = express();
// expose the public/ directory, which contains the front-end html & css
app.use(express.static(__dirname + '/public'));
// app.use(session({secret: 'shh'}));
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// socket io mounts on top of node's http server?
const io = new Server(server);
// var sess;

const db_ = require("@replit/database");
const db = new db_();

app.get('/', (req, res) => {
    // sess = req.session;
    // console.log("got a request");
    // sess.id = req.sessionID;
    res.sendFile(__dirname + "/public/name.html");
});

// app.get('/public/style.css', (req, res) => {
//     // sess = req.session;
//     // console.log("got a request");
//     // sess.id = req.sessionID;
//     res.sendFile(__dirname + "/public/style.css");
// });

app.get('/values', (req, res) => {
    console.log(db);
    // console.log("URL: ", process.env.REPLIT_DB_URL);
    db.list().then(keys => {
        keys.forEach((k) => {
            db.get(k).then(v => {
                console.log(k + ": " + v);
            });
        });
    });
});

app.get('/deleteKeys', (req, res) => {
    // console.log("URL: ", process.env.REPLIT_DB_URL);
    db.list().then(keys => {
        keys.forEach((k) => {
            console.log("deleting key: ", k);
            db.delete(k);
        });
        console.log("all keys deleted");
    });
});

app.get('/global', (req, res) => {
    // sess = req.session;
    // console.log("got a request");
    // sess.id = req.sessionID;
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/chat', (req, res) => {
    // sess = req.session;
    // console.log("got a request");
    // sess.id = req.sessionID;
    
    // const username = req.query.username;
    // db.get(username).then(response => {
    //     // if the username wasn't found, redirect to home
    //     if (response == null) {
    //         res.redirect('start');
    //     }
    //     else {
    //         const socketId = req.query.socketId;
    //         db.set(username, socketId);
    //         res.sendFile(__dirname + "/public/index.html");
    //     }
    // });
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/start', (req, res) => {
    // console.log("got a request");
    res.sendFile(__dirname + "/public/name.html");
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('user disconnected: ', socket.id);
    });
});

io.on('connection', (socket) => {
    socket.on('removeUsername', () => {
        let gotEntry = false;
        db.list().then(keys => {
            keys.forEach((k) => {
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
        // console.log('username removed: ', socket.id);
    });
});

io.on('connection', (socket) => {
    console.log("A user connected: ", socket.id);
});

io.on('connection', (socket) => {
    socket.on('go to chat', (msg) => {
        const username = msg["username"];
        const socketId = msg["socketId"];
        db.get(username).then(response => {
            // if the username wasn't found, redirect to home
            if (response == null || response != socketId) {
                socket.emit('alert', 'Something went wrong. Please try again!');
            }
            else {
                socket.emit('redirect', '/chat');
                // res.sendFile(__dirname + "/public/index.html");
            }
        });
    });
});

io.on('connection', (socket) => {
    socket.on('audio message', (msg) => {
        socket.broadcast.emit('audio message', msg);
        console.log('got an audio message');
    });
});

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

server.listen(3000, () => {
    console.log('listening on *:3000');
});
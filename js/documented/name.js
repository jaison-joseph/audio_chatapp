// const db_ = require("@replit/database");
// const db = new db_();
// const io = require("socket.io-client");
// import { io } from "socket.io-client";
var socket = io();

function onSubmit() {
    // db.set("key", "value");
    // key = await db.get("key");
    // console.log(key); 
    const form = document.getElementById("nameForm");
    // var socket = io('localhost');  

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.getElementById("name").value;
        console.log("name: ", name);
        socket.emit('checkUniqueName', name);
        socket.once("checkUniqueNameResponse", (msg) => {
            console.log("entering checkNameResponse callback: ", msg);
            if (msg == "exists") {
                console.log("that username is already taken, please try another one");
                alert("that username is already taken, please try another one");
            }
            else {
                console.log("ouu nice");
                sessionStorage.setItem("username", name);
                sessionStorage.setItem("socketId", socket["id"]);
                window.location.href = "/chat";
            }
        });
        console.log("end of submit button callback");
        // consolee.log("socketId: ", socket.io.engine.id);
    });
}
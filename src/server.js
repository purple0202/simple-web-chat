import http from "http";
import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
// app.get("/*", (req,res) => res.redirect("/"));



console.log("hello");

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);
const wsServer = SocketIO(server);

wsServer.on("connection", socket => {
    socket["nickname"] = "anon"
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    console.log("connected to Browser!");
    socket.on("enter_room", (msg, done) => {
        const roomName = msg.payload;
        console.log(typeof roomName);
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", socket.nickname, msg);
        done();
    });
    socket.on("nickname", (name) => {
        socket["nickname"] = name;
        socket.emit("name_welcome", name);
    });
})

server.listen(3000, handleListen);

// const wss = new WebSocket.Server({ server });

// const sockets = [];

// function handleConnection(socket) {
//     console.log(socket);
// } comment for commit


// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = 'Anon';
//     console.log("Connected to Browser");
//     socket.on("close",() => console.log("Disconnected from the Browser!"));
//     socket.on("message", (message) => {
//         console.log("New message!: ", message.toString());
//         const parsed = JSON.parse(message);
//         console.log(parsed);
//         switch (parsed.type) {
//             case "new_msg":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${parsed.payload}`));
//                 break
//             case "username":
//                 console.log("Nickname: ", parsed.payload);
//                 socket["nickname"] = parsed.payload;
//                 break
//         }
//         // socket.send(message.toString());
//     });
//     // socket.send("hello!");
// });

// server.listen(3000, handleListen);

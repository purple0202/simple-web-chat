import http from "http";
import WebSocket from "ws";
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
const wss = new WebSocket.Server({ server });

const sockets = [];

// function handleConnection(socket) {
//     console.log(socket);
// }

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = 'Anon';
    console.log("Connected to Browser");
    socket.on("close",() => console.log("Disconnected from the Browser!"));
    socket.on("message", (message) => {
        console.log("New message!: ", message.toString());
        const parsed = JSON.parse(message);
        console.log(parsed);
        switch (parsed.type) {
            case "new_msg":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${parsed.payload}`));
                break
            case "username":
                console.log("Nickname: ", parsed.payload);
                socket["nickname"] = parsed.payload;
                break
        }
        // socket.send(message.toString());
    });
    // socket.send("hello!");
});

server.listen(3000, handleListen);

const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("#roomname");
const room = document.getElementById("room");
const msgForm = room.querySelector("#msg");
const nameForm = welcome.querySelector("#name");

room.hidden = true;
nameForm.addEventListener("submit", handleNicknameSubmit);

let roomname;

function handleMsgSubmit(event){
    event.preventDefault();
    const input = msgForm.querySelector("input");
    const content = input.value;
    socket.emit("new_message", content, roomname, () => {
        addMessage(`You: ${content}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = nameForm.querySelector("input");
    socket.emit("nickname", input.value);
    nameForm.hidden = true;
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomname}`;
    msgForm.addEventListener("submit", handleMsgSubmit);

}

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleRoomSubmit(event){
    console.log("room name submitted!");
    event.preventDefault();
    const input = form.querySelector("input");
    roomname = input.value;
    socket.emit("enter_room", { payload: input.value }, showRoom);
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {addMessage(`${user} joined!`)})
socket.on("bye", (user) => {addMessage(`${user} left!`)})
socket.on("new_message", (user, msg) => {addMessage(`${user}: ${msg}`)})
socket.on("name_welcome", (name) => {addMessage(`Hello, ${name}!`)})

// const msgList = document.querySelector("ul");
// const msgForm = document.querySelector("#msg");
// const nameForm = document.querySelector("#nickname");

// const socket = new WebSocket(`ws://${window.location.host}`)

// socket.addEventListener("open", () => {
//     console.log("Connected to Server");
// });

// socket.addEventListener("message", (message) => {
//     // console.log("Just got this: ", message.data, " from the server!");
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     msgList.append(li);
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnected from server!");
// });

// // setTimeout(() => {
// //     socket.send("hello from the browser!");
// // }, 1000);

// function makeMsg(type, payload){
//     const msg = {type, payload}
//     return JSON.stringify(msg);
// }

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = msgForm.querySelector("input");
//     socket.send(makeMsg("new_msg", input.value));
//     console.log(input.value);
// }

// function handleNameSubmit(event) {
//     event.preventDefault();
//     const input = nameForm.querySelector("input");
//     socket.send(makeMsg("username", input.value));
// }

// msgForm.addEventListener("submit", handleSubmit);
// nameForm.addEventListener("submit", handleNameSubmit);
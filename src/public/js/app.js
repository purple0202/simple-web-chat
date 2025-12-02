const msgList = document.querySelector("ul");
const msgForm = document.querySelector("#msg");
const nameForm = document.querySelector("#nickname");

const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    // console.log("Just got this: ", message.data, " from the server!");
    const li = document.createElement("li");
    li.innerText = message.data;
    msgList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from server!");
});

// setTimeout(() => {
//     socket.send("hello from the browser!");
// }, 1000);

function makeMsg(type, payload){
    const msg = {type, payload}
    return JSON.stringify(msg);
}

function handleSubmit(event) {
    event.preventDefault();
    const input = msgForm.querySelector("input");
    socket.send(makeMsg("new_msg", input.value));
    console.log(input.value);
}

function handleNameSubmit(event) {
    event.preventDefault();
    const input = nameForm.querySelector("input");
    socket.send(makeMsg("username", input.value));
}

msgForm.addEventListener("submit", handleSubmit);
nameForm.addEventListener("submit", handleNameSubmit);
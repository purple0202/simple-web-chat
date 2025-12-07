const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const faceBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia(deviceID){
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user"},
    };
    const cameraConstraints = {
        audio: true,
        video: {deviceId: {exact: deviceID}},
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceID ? cameraConstraints : initialConstraints
        );
        console.log(myStream);
        myFace.srcObject = myStream;
        if (!deviceID){
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

getMedia();

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === camera.label){
                option.selected = true;
            }
            cameraSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true
    } else {
        muteBtn.innerText = "Mute";
        muted = false
    }
}

function handleCameraClick() {
    console.log(myStream.getVideoTracks());
    myStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    if(cameraOff){
        faceBtn.innerText = "Turn Camera Off"
        cameraOff = false
    } else {
        faceBtn.innerText = "Turn Camera ON"
        cameraOff = true
    }
}

async function handleCameraChange(){
    console.log(cameraSelect.value);
    await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
faceBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);



// const socket = io();

// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("#roomname");
// const room = document.getElementById("room");
// const msgForm = room.querySelector("#msg");
// const nameForm = welcome.querySelector("#name");
// const nameChangeForm = room.querySelector("#changename");

// room.hidden = true;
// nameForm.addEventListener("submit", handleNicknameSubmit);

// let roomname;

// function handleMsgSubmit(event){
//     event.preventDefault();
//     const input = msgForm.querySelector("input");
//     const content = input.value;
//     socket.emit("new_message", content, roomname, () => {
//         addMessage(`You: ${content}`);
//     });
//     input.value = "";
// }

// function handleNicknameSubmit(event) {
//     event.preventDefault();
//     const input = nameForm.querySelector("input");
//     socket.emit("nickname", input.value);
//     nameForm.hidden = true;
// }

// function showRoom() {
//     welcome.hidden = true;
//     room.hidden = false;
//     const h3 = room.querySelector("h3");
//     h3.innerText = `Room ${roomname}`;
//     msgForm.addEventListener("submit", handleMsgSubmit);

// }

// function addMessage(message){
//     const ul = room.querySelector("ul");
//     const li = document.createElement("li");
//     li.innerText = message;
//     ul.appendChild(li);
// }

// function handleRoomSubmit(event){
//     console.log("room name submitted!");
//     event.preventDefault();
//     const input = form.querySelector("input");
//     roomname = input.value;
//     socket.emit("enter_room", { payload: input.value }, showRoom);
//     input.value = "";
// }

// function handleNewName(event){
//     event.preventDefault();
//     const input = nameChangeForm.querySelector("input");
//     newName = input.value;
//     socket.emit("new_name", { payload:input.value }, roomname);
//     addMessage(`Your nickname was updated to: ${newName}!`)
//     input.value = ""
// }

// form.addEventListener("submit", handleRoomSubmit);
// nameChangeForm.addEventListener("submit", handleNewName);

// socket.on("welcome", (user) => {addMessage(`${user} joined!`)})
// socket.on("bye", (user) => {addMessage(`${user} left!`)})
// socket.on("new_message", (user, msg) => {addMessage(`${user}: ${msg}`)})
// socket.on("name_welcome", (name) => {addMessage(`Hello, ${name}!`)})
// socket.on("new_name", (oldname, newname) => {addMessage(`${oldname} has updated their nickname to: ${newname}!`)})
// // socket.on("room_change", console.log);
// socket.on("room_change", (rooms) => {
//     const roomList = welcome.querySelector("ul");
//     roomList.innerHTML = "";
//     if(rooms.length === 0) {
//         return;
//     }
//     rooms.forEach((room) => {
//         const li = document.createElement("li");
//         li.innerText = room;
//         roomList.append(li);
//     })
// })
// // const msgList = document.querySelector("ul");
// // const msgForm = document.querySelector("#msg");
// // const nameForm = document.querySelector("#nickname");

// // const socket = new WebSocket(`ws://${window.location.host}`)

// // socket.addEventListener("open", () => {
// //     console.log("Connected to Server");
// // });

// // socket.addEventListener("message", (message) => {
// //     // console.log("Just got this: ", message.data, " from the server!");
// //     const li = document.createElement("li");
// //     li.innerText = message.data;
// //     msgList.append(li);
// // });

// // socket.addEventListener("close", () => {
// //     console.log("Disconnected from server!");
// // });

// // // setTimeout(() => {
// // //     socket.send("hello from the browser!");
// // // }, 1000);

// // function makeMsg(type, payload){
// //     const msg = {type, payload}
// //     return JSON.stringify(msg);
// // }

// // function handleSubmit(event) {
// //     event.preventDefault();
// //     const input = msgForm.querySelector("input");
// //     socket.send(makeMsg("new_msg", input.value));
// //     console.log(input.value);
// // }

// // function handleNameSubmit(event) {
// //     event.preventDefault();
// //     const input = nameForm.querySelector("input");
// //     socket.send(makeMsg("username", input.value));
// // }

// // msgForm.addEventListener("submit", handleSubmit);
// // nameForm.addEventListener("submit", handleNameSubmit);
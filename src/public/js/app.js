const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const faceBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras");
const room = document.getElementById("room");
const msgForm = room.querySelector("#msg");
// const nameForm = welcome.querySelector("#name");
const nameChangeForm = room.querySelector("#changename");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden = true;
room.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let dataChannel;

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

// getMedia();

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
    // console.log(cameraSelect.value);
    await getMedia(cameraSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        // console.log(videoSender)
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
faceBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);


welcomeForm = welcome.querySelector("form");

async function readyCall(){
    await getMedia();
    makeConnection();
}

async function initCall(bool) {
    if(bool === true){
        welcome.hidden = true;
        call.hidden = false;
        room.hidden = false;
        // await getMedia();
        // makeConnection();
    }  else {
        alert("Room is already full! Sorry!");
    }
    
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    // await initCall();
    await readyCall();
    socket.emit("join_room",input.value, initCall);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)

socket.on("welcome", async () => {
    // await initCall();
    // welcome.hidden = true;
    // call.hidden = false;
    // room.hidden = false;
    dataChannel = myPeerConnection.createDataChannel("chat");
    dataChannel.addEventListener("message", (event) => {addMessage("Other user: " + event.data)});
    console.log("created data channel!");
    console.log("someone joined");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("Sent the offer!");
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
        dataChannel = event.channel;
        dataChannel.addEventListener("message", (event) => {addMessage("Other user: " + event.data)});
    });
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer()
    console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
})

socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", (ice) => {
    console.log("received candidate!")
    myPeerConnection.addIceCandidate(ice);
})

function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ]
        }]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
    socket.emit("ice", data.candidate, roomName);
    console.log("sent ice candidate!")
    // console.log(data);
}

function handleAddStream(data) {
    const peerStream = document.getElementById("peerStream");
    peerStream.srcObject = data.stream;
}


function handleSubmit(event) {
    event.preventDefault();
    const input = msgForm.querySelector("input");
    if(dataChannel){
        dataChannel.send(input.value);
        addMessage("You: " + input.value);
        input.value = "";
    }
}

const msgList = document.querySelector("ul");
// const msgForm = document.querySelector("#msg");

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}


msgForm.addEventListener("submit", handleSubmit);

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
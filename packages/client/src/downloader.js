/* Core Deps */
const net = require("net");
const Buffer = require("buffer").Buffer;

/* Internal Modules */
const tracker = require("./tracker.js");

const downloader = torrent => 
    tracker(torrent, peers => 
        peers.forEach(download));

function download(peer) {
    const socket = net.Socket();
    socket.on("error", console.log);
    socket.connect(peer.port, peer.ip, () => {

    });

    socket.on("data", data => {

    });

    function onMsgComplete(socket, fn) {
        let persistedBuffer = Buffer.alloc(0);
        let handshake = true;
      
        socket.on("data", recvBuffer => {
            // calculates entire msg len
            const msgLength = () => handshake ? persistedBuffer.readUInt8(0) + 49 : persistedBuffer.readInt32BE(0) + 4;
            persistedBuffer = Buffer.concat([persistedBuffer, recvBuffer]);
      
            while (persistedBuffer.length >= 4 && persistedBuffer.length >= msgLength()) {
                fn(persistedBuffer.slice(0, msgLength()));
                persistedBuffer = persistedBuffer.slice(msgLength());
                handshake = false;
            }
        });
    }
}

function msgHandler(msg, socket) {
    if (isHandshake(msg)){
        socket.write(message.buildInterested());
    } else {
        const parsed = message.parse(msg);
        switch(parsed.id) {
            case 0:
                chokeHandler();
                break;
            case 1:
                unchokeHandler();
                break;
            case 4: 
                haveHandler(parsed.payload);
                break;
            case 5:
                bitfieldHandler(parsed.payload);
                break;
            case 7:
                pieceHandler(parsed.payload);
                break;
            default:
                return;
        }
    }
}
  
function isHandshake(msg) {
    return msg.length === msg.readUInt8(0) + 49 &&
        msg.toString("utf8", 1) === "BitTorrent protocol";
}

function chokeHandler() { ... }

function unchokeHandler() { ... }

function haveHandler(payload) { ... }

function bitfieldHandler(payload) { ... }

function pieceHandler(payload) { ... }

module.exports = downloader;
/* Core Deps */
const dgram = require("dgram");
const Buffer = require("buffer").Buffer;
const urlParse = require("url").parse;
const crypto = require("crypto");

const getPeers = (torrent = process.argv[2], fn) => {
    // use normal 4-byte IPv4 format
    const socket = dgram.createSocket("udp4");
    const url = urlParse(torrent.announce.toString("utf8"));

    // init connection request
    udpSend(socket, buildConnReq(), url);

    socket.on("message", res => {
        if (resType(res) === "connect") {
            // recv and parse response to connection rq
            const connRes = parseConnRes(res);
            // send announce rq
            const announceReq = buildAnnounceReq(connRes.connectionId);
            udpSend(socket, announceReq, url);
        } else if (resType(res) === "announce") {
            // parse announce res
            const announceRes = parseAnnounceResp(res);
            // fwd peers to cb
            fn(announceRes.peers);
        }
    });
}

// helper - avoid need to set offset/len in favor of entire buffer
function udpSend(socket, message, rawUrl, fn = () => { }) {
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host, fn);
}

// res to connect or announce rq? both emit to same socket
function resType() {

}

function buildConnReq() {
    const buf = Buffer.alloc(16); // new empty buffer - 16 bytes (anticipated message size)

    // connection ID - two unsigned 32-bit int in 4 byte chunks collate to full 64-bit msg
    buf.writeUInt32BE(0x417, 0); 
    buf.writeUInt32BE(0x27101980, 4);

    // action
    buf.writeUInt32BE(0, 8);

    // Tx ID
    crypto.randomBytes(4).copy(buf, 12);

    return buf;
}

function parseConnRes(resp) {
    return {
        action: resp.readUInt32BE(0), 
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8) // get last 8 bytes
    };
}

function buildAnnounceReq(connId) {
// ...
}

function parseAnnounceResp(resp) {
// ...
}

module.exports = {
    getPeers
}
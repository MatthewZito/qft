/* Core Deps */
const Buffer = require("buffer").Buffer;
const crypto = require("crypto");
const dgram = require("dgram");
const urlParse = require("url").parse;

const tracker = (torrent, fn) => {
    // use normal 4-byte IPv4 format
    const socket = dgram.createSocket("udp4");
    const url = urlParse(torrent.announce.toString("utf8"));

    // init connection request
    udpSend(socket, constructConnReq(), url);

    socket.on("message", res => {
        if (resType(res) === "connect") {
            // recv and parse response to connection rq
            const connRes = parseConnRes(res);
            // send announce rq
            const announceReq = constructAnnounceReq(connRes.connectionId);
            udpSend(socket, announceReq, url);
        } else if (resType(res) === "announce") {
            // parse announce res
            const announceRes = parseAnnounceResp(res);
            // fwd peers to cb
            fn(announceRes.peers);
        }
    });
};

// helper - avoid need to set offset/len in favor of entire buffer
function udpSend(socket, message, rawUrl, fn = () => {}) {
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host, fn);
}

// res to connect or announce rq? both emit to same socket
function resType() {
    const action = resp.readUInt32BE(0);
    if (action === 0) {
        return "connect";
    }
    if (action === 1) {
        return "announce";
    }
}

function constructConnReq() {
    const buffer = Buffer.alloc(16); // new empty buffer - 16 bytes (anticipated message size)

    // connection ID - two unsigned 32-bit int in 4 byte chunks collate to full 64-bit msg
    buffer.writeUInt32BE(0x417, 0); 
    buffer.writeUInt32BE(0x27101980, 4);

    // action
    buffer.writeUInt32BE(0, 8);

    // Tx ID
    crypto.randomBytes(4).copy(buffer, 12);

    return buffer;
}

function parseConnRes(resp) {
    return {
        action: resp.readUInt32BE(0), 
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8) // get last 8 bytes
    };
}

function constructAnnounceReq(connId, torrent, port) {
    const buffer = Buffer.allocUnsafe(98);

    // conn ID
    connId.copy(buffer, 0);
    // action 
    buffer.writeUInt32BE(1, 8);
    // Tx ID
    crypto.randomBytes(4).copy(buffer, 12);
    // infohash
    torrentParser.infoHash(torrent).copy(buffer, 16);
    // peer ID
    util.genId().copy(buffer, 36);
    // downloaded
    Buffer.alloc(8).copy(buffer, 56);
    // left
    torrentParser.size(torrent).copy(buffer, 64);
    // uploaded
    Buffer.alloc(8).copy(buffer, 72);
    // event
    buffer.writeUInt32BE(0, 80);
    // IP addr
    buffer.writeUInt32BE(0, 80);
    // key
    crypto.randomBytes(4).copy(buffer, 88);
    // num want
    buffer.writeInt32BE(-1, 92);
    // port
    buffer.writeUInt16BE(port, 96);
  
    return buffer;
}

function parseAnnounceResp(resp) {
    const group = (iterable, groupSize) => {
        const groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) {
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    };
    
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map(address => ({
            ip: address.slice(0, 4).join("."),
            port: address.readUInt16BE(4)
        }))
    };
};

module.exports = tracker;
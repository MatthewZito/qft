const Buffer = require("buffer").Buffer;
const parser = require("./parser");

const constructHandshake = torrent => {
    const buffer = Buffer.alloc(68);
    // pstrlen
    buffer.writeUInt8(19, 0);
    // pstr
    buffer.write("BitTorrent protocol", 1);
    // reserved
    buffer.writeUInt32BE(0, 20);
    buffer.writeUInt32BE(0, 24);
    // info hash
    parser.infoHash(torrent).copy(buffer, 28);
    // peer id
    buffer.write(util.genId());
    return buffer;
};

const constructKeepAlive = () => Buffer.alloc(4);

const constructChoke = () => {
    const buffer = Buffer.alloc(5);
    // len
    buffer.writeUInt32BE(1, 0);
    // id
    buffer.writeUInt8(0, 4);
    return buffer;
};

const constructUnchoke = () => {
    const buffer = Buffer.alloc(5);
    // len
    buffer.writeUInt32BE(1, 0);
    // id
    buffer.writeUInt8(1, 4);
    return buffer;
};

const constructInterested = () => {
    const buffer = Buffer.alloc(5);
    // len
    buffer.writeUInt32BE(1, 0);
    // id
    buffer.writeUInt8(2, 4);
    return buffer;
};

const constructUninterested = () => {
    const buffer = Buffer.alloc(5);
    // len
    buffer.writeUInt32BE(1, 0);
    // id
    buffer.writeUInt8(3, 4);
    return buffer;
};

const constructHave = payload => {
    const buffer = Buffer.alloc(9);
    // len
    buffer.writeUInt32BE(5, 0);
    // id
    buffer.writeUInt8(4, 4);
    // piece index
    buffer.writeUInt32BE(payload, 5);
    return buffer;
};

const constructBitfield = bitfield => {
    const buffer = Buffer.alloc(14);
    // len
    buffer.writeUInt32BE(payload.length + 1, 0);
    // id
    buffer.writeUInt8(5, 4);
    // bitfield
    bitfield.copy(buffer, 5);
    return buffer;
};

const constructRequest = payload => {
    const buffer = Buffer.alloc(17);
    // len
    buffer.writeUInt32BE(13, 0);
    // id
    buffer.writeUInt8(6, 4);
    // piece index
    buffer.writeUInt32BE(payload.index, 5);
    // begin
    buffer.writeUInt32BE(payload.begin, 9);
    // len
    buffer.writeUInt32BE(payload.length, 13);
    return buffer;
};

const constructPiece = payload => {
    const buffer = Buffer.alloc(payload.block.length + 13);
    // len
    buffer.writeUInt32BE(payload.block.length + 9, 0);
    // id
    buffer.writeUInt8(7, 4);
    // piece index
    buffer.writeUInt32BE(payload.index, 5);
    // begin
    buffer.writeUInt32BE(payload.begin, 9);
    // block
    payload.block.copy(buffer, 13);
    return buffer;
};

const constructCancel = payload => {
    const buffer = Buffer.alloc(17);
    // len
    buffer.writeUInt32BE(13, 0);
    // id
    buffer.writeUInt8(8, 4);
    // piece index
    buffer.writeUInt32BE(payload.index, 5);
    // begin
    buffer.writeUInt32BE(payload.begin, 9);
    // len
    buffer.writeUInt32BE(payload.length, 13);
    return buffer;
};

const constructPort = payload => {
    const buffer = Buffer.alloc(7);
    // len
    buffer.writeUInt32BE(3, 0);
    // id
    buffer.writeUInt8(9, 4);
    // listen port
    buffer.writeUInt16BE(payload, 5);
    return buffer;
};

const parseMsg = msg => {
    const id = msg.length > 4 ? msg.readInt8(4) : null;
    let payload = msg.length > 5 ? msg.slice(5) : null;
    if (id === 6 || id === 7 || id === 8) {
        const rest = payload.slice(8);
        payload = {
            index: payload.readInt32BE(0),
            begin: payload.readInt32BE(4)
        };
        payload[id === 7 ? 'block' : 'length'] = rest;
    }
  
    return {
        size : msg.readInt32BE(0),
        id : id,
        payload : payload
    };
};

module.exports = {
    constructHandshake,
    constructKeepAlive,
    constructChoke,
    constructUnchoke,
    constructInterested,
    constructUninterested,
    constructHave,
    constructBitfield,
    constructRequest,
    constructPiece,
    constructCancel,
    constructPort,
    parseMsg
};
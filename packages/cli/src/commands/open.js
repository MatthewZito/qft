#!/usr/bin/env node
const fs = require("fs");
const bencode = require("bencode");
const dgram = require("dgram");
const Buffer = require("buffer").Buffer;
const urlParse = require("url").parse;

const openFile = file => {
    const torrent = bencode.decode(fs.readFileSync(file));
    const url = urlParse(torrent.announce.toString("utf8"));

    // use normal 4-byte IPv4 format
    const socket = dgram.createSocket("udp4");
 
    const msg = Buffer.from("hello?", "utf8");

    socket.send(msg, 0, msg.length, url.port, url.host, () => {});

    socket.on("message", msg => {
    console.log("message is", msg);
    });
} 

exports.command = "open"
exports.desc = "Open and read a torrent file"
exports.builder = {
    file: {
        describe: "Specify a torrent to read",
        demandOption: true,
        type: "string"
    },
}
exports.handler = (argv) => {
    openFile(argv.file);
}
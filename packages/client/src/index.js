/* Internal Modules */
const tracker = require("./tracker.js");
const parser = require("./parser.js");
const downloader = require("./downloader.js");

if (!file) {
    throw new Error("[-] A file argument is required.");
}

const torrent = parser.open(/*  wire to cli*/ file);

tracker(torrent, peers => console.log(peers));

downloader(torrent);
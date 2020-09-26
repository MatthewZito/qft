#!/usr/bin/env node

/* Core Deps */
const fs = require("fs");

/* Userland Deps */
const bencode = require("bencode");

/* Internal Modules */
const tracker = require("./tracker.js");
const parser = require("./parser.js");

const file = process.argv[2];

if (!file) {
    throw new Error("[-] A file argument is required.");
}

const torrent = torrentParser.open(file);

tracker.getPeers(torrent, peers => console.log(peers));
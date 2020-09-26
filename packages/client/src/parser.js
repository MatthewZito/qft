/* Core Deps */
const crypto = require("crypto");
const fs = require("fs");

/* Userland Deps */
const bignum = require('bignum');
const bencode = require("bencode");

const open = (filepath) => bencode.decode(fs.readFileSync(filepath));

const size = torrent => {
    const weight = torrent.info.files ?
    // multiple files
    torrent.info.files.map(file => file.length).reduce((x, y) => x + y) :
    // torrent has single file
    torrent.info.length;

    return bignum.toBuffer(weight, { size: 8 });
};

// must use SHA-1; see https://wiki.theory.org/index.php/BitTorrentSpecification
const infoHash = torrent => {
    const info = bencode.encode(torrent.info);
    return crypto.createHash("sha1").update(info).digest();
};

module.exports = {
    open,
    size,
    infoHash
};
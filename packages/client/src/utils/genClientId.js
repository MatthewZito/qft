const crypto = require("crypto");

let id = null;

const generateClientId = () => {
    if (!id) {
        id = crypto.randomBytes(20);
        Buffer.from("-QF0001-").copy(id, 0);
    }
    return id;
};

module.exports = generateClientId;
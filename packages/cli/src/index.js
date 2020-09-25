#!/usr/bin/env node
const yargs = require("yargs");

const argv = yargs
    .commandDir("commands")
    .demandCommand(1, "[-] You must specify a command.")
    .argv
    
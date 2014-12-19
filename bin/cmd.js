#!/usr/bin/env node

var browserifyDirectory = require("../");

// options unique to browserifyDirectory and not passed into browserify
BROWSERIFYDIRECTORY_OPTS = ['_', 't', 'transform', 'e', 'outputExt'];

var argv = require("minimist")(process.argv.slice(2));

// exit if input and output directory arguments aren't included
if(argv._.length < 2) {
    console.error("Input and output file/directory arguments required");
    process.exit(-1);
}

// set browserify opts for browserify instance in browserify-directory
var browserifyOpts = {};
for (key in argv) {
    if (BROWSERIFYDIRECTORY_OPTS.indexOf(key) < 0) {
        browserifyOpts[key] = argv[key];
    }
}

new browserifyDirectory({
    inputDir: argv._[0],
    outputDir: argv._[1],
    transform: argv.t || argv.transform || null,
    transformExtension: argv.e || argv.outputExtension || null,
    browserifyOpts: browserifyOpts
})

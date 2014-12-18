#!/usr/bin/env node

var directify = require("../");

// options unique to directify and not passed into browserify
DIRECTIFY_OPTS = ['_', 't', 'transform', 'e', 'outputExt'];

var argv = require("minimist")(process.argv.slice(2));

// exit if input and output directory arguments aren't included
if(argv._.length < 2) {
    console.error("Input and output file/directory arguments required");
    process.exit(-1);
}

// set browserify opts for browserify instance in directify
var browserifyOpts = {};
for (key in argv) {
    if (DIRECTIFY_OPTS.indexOf(key) < 0) {
        browserifyOpts[key] = argv[key];
    }
}

new directify({
    inputDir: argv._[0],
    outputDir: argv._[1],
    transform: argv.t || argv.transform || null,
    transformExtension: argv.e || argv.outputExtension || null,
    browserifyOpts: browserifyOpts
})

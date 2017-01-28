#!/usr/bin/env node

var browserifyDirectory = require("../"),
    argv,
    browserifyOpts = {},
    transform;

function coalesceArgs(argv, argShortName, argFullName) {
    shortVal = argv[argShortName];
    longVal = argv[argFullName];
    if (typeof shortVal === "string" || typeof longVal === "string") {
        return [shortVal || longVal];
    } else {
        return  shortVal || longVal || [];
    }
}

// options unique to browserifyDirectory and not passed into browserify
BROWSERIFYDIRECTORY_OPTS = ['_', 't', 'transform', 'e', 'outputExt', 'p', 'usePolling', 'excludeExt', 'z'];

argv = require("minimist")(process.argv.slice(2));

// exit if input and output directory arguments aren't included
if(argv._.length < 2) {
    console.error("Input and output file/directory arguments required");
    process.exit(-1);
}

// set browserify opts for browserify instance in browserify-directory
for (key in argv) {
    if (BROWSERIFYDIRECTORY_OPTS.indexOf(key) < 0) {
        browserifyOpts[key] = argv[key];
    }
}

transform = coalesceArgs(argv, "t", "transform")
excludeExtensions = coalesceArgs(argv, "z", "excludeExt")

new browserifyDirectory({
    inputDir: argv._[0],
    outputDir: argv._[1],
    transform: transform,
    usePolling: argv.p || argv.usePolling || null,
    transformExtension: argv.e || argv.outputExtension || null,
    excludeExtensions: excludeExtensions,
    browserifyOpts: browserifyOpts
})

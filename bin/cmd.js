var directify = require("../");

// options unique to directify and not passed into browserify
DIRECTIFY_OPTS = ['_', 'o', 'output', 't', 'transform', 'e', 'outputExt']

var argv = require("minimist")(process.argv.slice(2));

if(argv._.length < 1 || (argv.o && argv.o.length < 1)) {
    console.error("Input and output file/directory arguments required");
    process.exit(-1);
}

// set browserify opts for browserify instance in directify
var browserifyOpts = {};
for (key in argv) {
    if (DIRECTIFY_OPTS.indexOf(key) < 0) {
        browserifyOpts[key] = argv[key]
    }
}

new directify({
    inputDir: argv._[0],
    outputDir: argv.o,
    transform: argv.t || argv.transform || null,
    transformExtension: argv.e || argv.outputExtension || null,
    browserifyOpts: browserifyOpts
}).run()

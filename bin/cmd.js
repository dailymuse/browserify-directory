var directify = require("../");

var argv = require("optimist")
    .usage("Loops over a directory and Watchify's all files in that directory")

    .options("w", {
        alias: "watch",
        describe: "Watch the input file/directory and bind watchify to that directory"
    })

    .boolean(["w"])

    .argv;

if(argv._.length < 2) {
    console.error("Input and output file/directory arguments required");
    process.exit(-1);
}

new directify({
    inputDir: argv._[0],
    outputDir: argv._[1]
})

var fs = require("fs");
var path = require("path");
var chokidar = require("chokidar");
var mkdirp = require("mkdirp");
var browserify = require("browserify");
var coffeeify = require("coffeeify");

module.exports = Directify;

function Directify(options) {
    options = options || {};

    this.inputDir = options.inputDir;
    this.outputDir = options.outputDir;

    this.curDir = __dirname;

    this.cache = {};
    this.deps = {};
    this._run();
}

// sets up watching of directories and events that should be triggered when 
// watcher events occur
Directify.prototype._run = function() {
    var self = this;

    if (!this.inputDir || !this.outputDir) {
        console.error("Input and output file/directory values are required");
        process.exit(-1);
    }

    if(!fs.existsSync(this.inputDir)) {
        console.error("Input file does not exist:", this.inputDir);
        process.exit(1);
    }

    // ensure watcher ignores .DS_Store files
    this.watcher = chokidar.watch(this.inputDir, { ignored: /\.DS_Store/ });

    // when a file is watched need to take initial action in order to browserify
    // the file correctly. Ensures the file is not a dependent file 
    // (tool should only browserify files in the input path)
    this.watcher.on("add", function(inputPath) {
        if(!(inputPath in self.deps)) {
            self._addPath(inputPath);
        }
    });

    // watch for changes on files that are being watched - this includes all
    // dependency filess
    this.watcher.on("change", function(changePath) {
        // only want to bundle files that have a browserify instance associated 
        // with it
        if(changePath in self.cache) {
            self._bundleShare(changePath);
        }

        // if the changed files is a dependency, loop over all the files 
        // that require said file and bundle the files
        if(changePath in self.deps) {
            var deps = self.deps[changePath];

            for(var i=0; i < deps.length; i++) {
                self._bundleShare(deps[i]);
            }
        }
    });
}

Directify.prototype._addPath = function(inputPath) {
    var self = this;

    // sets the outputpath to write to and replaces the extension for coffeescript
    var outputPath = this._replaceExtension(path.join(this.outputDir, path.relative(this.inputDir, inputPath)), ".coffee", ".js");

    // used to create parent directories that don't exist
    var parentDirectoryPath = path.join(outputPath, "..");

    mkdirp(parentDirectoryPath, function(err) {
        if(err) {
            console.error("Could not create parent directory `" + parentDirectoryPath + "`:", err);
            return;
        }   

        self._browserifyFile(inputPath, outputPath);
    });
}

// used internally to replace extension - should be configured for transforms
Directify.prototype._replaceExtension = function(filepath, expectedExtension, newExtension) {
    var dirpath = path.dirname(filepath);
    var filename = path.basename(filepath, expectedExtension) + newExtension;
    return path.join(dirpath, filename);
}

// creates a browserify instance for an inputFile and binds necessary browserify
// events 
Directify.prototype._browserifyFile = function(inputPath, outputPath) {
    var self = this;

    // create browserify instance based on absolute path of input file
    var b = browserify(path.resolve(inputPath));

    // add input path to this.cache for easy tracking of the inputPaths 
    // browserify instance and the outputpath associated with it
    this.cache[inputPath] = {
        b: b,
        outputPath: outputPath
    }

    // when a browserify dependency is detected
    b.on("dep", function(dep) {
        // turn the browserify dependency file into a relative path to match
        // the file path structure of inputPath
        var depFile = path.relative(self.curDir, dep.file);
        
        // watch file when file isn't in self.deps and not in self.cache
        if (!(depFile in self.deps) && !(depFile in self.cache)) {
            self.watcher.add(depFile);
        }

        // if the dependency file doesn't equal the inputPath 
        if (depFile !== inputPath) {
            if (depFile in self.deps) {
                self.deps[depFile].push(inputPath);
            } else {
                
                self.deps[depFile] = [inputPath]
            }
        }
    });

    // add coffeeify transform 
    // REPLACE WITH TRANSFORM FUNCTION
    b.transform(coffeeify);

    b.on("error", function(err) {
        console.log(err)
    });

    // Call on browserify initialization so that browserfication happens
    // on script execution
    this._bundleShare(inputPath);
}

// get the inputs browserify bundle and write it to the outputPath
Directify.prototype._bundleShare = function(inputPath) {
    // input object with associated browserify instance and outputPath
    input = this.cache[inputPath];
    
    try {
        input.b.bundle()
            .pipe(fs.createWriteStream(input.outputPath));

        console.log('compiled ' + path.resolve(input.outputPath));
    } catch(error) {
        console.error(error);
    }
}



var fs = require("fs");
var path = require("path");
var chokidar = require("chokidar");
var mkdirp = require("mkdirp");
var browserify = require("browserify");

module.exports = BrowserifyDirectory;

function BrowserifyDirectory(options) {
    options = options || {};

    this.inputDir = options.inputDir;
    this.outputDir = options.outputDir;
    this.usePolling = options.usePolling || false;
    this.transform = options.transform || null;
    this.transformExtension = options.transformExtension || null;
    this.browserifyOpts = options.browserifyOpts || {};

    this.curDir = __dirname;

    this.cache = {};
    this.deps = {};

    this._run()
}

// sets up watching of directories and events that should be triggered when 
// watcher events occur
BrowserifyDirectory.prototype._run = function() {
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
    this.watcher = chokidar.watch(this.inputDir, { usePolling: this.usePolling, ignored: /\.DS_Store/ });

    // when a file is watched need to take initial action in order to browserify
    // the file correctly. Ensures the file is not a dependent file 
    // (tool should only browserify files in the input path)
    this.watcher.on("add", function(inputPath) {
        if(!(inputPath in self.deps)) {
            // need to turn into relative path because browserify returns 
            // absolute paths and in order to do path matching correctly 
            // need to make paths relative for self.cache and self.deps
            self._addPath(path.relative(self.curDir, inputPath));
        }
    });

    // watch for changes on files that are being watched - this includes all
    // dependency filess
    this.watcher.on("change", function(changePath) {
        // only want to bundle files that have a browserify instance associated 
        // with it

        // need to turn into relative path because browserify returns 
        // absolute paths and in order to do path matching correctly 
        // need to make paths relative for self.cache and self.deps
        changePath = path.relative(self.curDir, changePath);
        if(changePath in self.cache) {
            self.bundleShare(changePath);
        }

        // if the changed files is a dependency, loop over all the files 
        // that require said file and bundle the files
        if(changePath in self.deps) {
            var deps = self.deps[changePath];

            for(var i=0; i < deps.length; i++) {
                self.bundleShare(deps[i]);
            }
        }
    });
}

BrowserifyDirectory.prototype._addPath = function(inputPath) {
    var self = this;

    // sets the outputpath to write to 
    var outputPath = path.join(this.outputDir, path.relative(this.inputDir, inputPath));
    // if extension rewrite was set in opts replace extension
    if(this.transformExtension) {
        outputPath = this.replaceExtension(outputPath, this.transformExtension, '.js');
    }

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

// convenience method to replace extension - should be configured for transforms
BrowserifyDirectory.prototype.replaceExtension = function(filepath, expectedExtension, newExtension) {
    var dirpath = path.dirname(filepath);
    var filename = path.basename(filepath, expectedExtension) + newExtension;
    return path.join(dirpath, filename);
}

// creates a browserify instance for an inputFile and binds necessary browserify
// events 
BrowserifyDirectory.prototype._browserifyFile = function(inputPath, outputPath) {
    var self = this;

    // create browserify instance based on absolute path of input file
    var b = browserify(path.resolve(inputPath), this.browserifyOpts);

    // add input path to this.cache for easy tracking of the inputPaths 
    // browserify instance and the outputpath associated with it
    this.cache[inputPath] = {
        b: b,
        outputPath: outputPath,
        inputPath: inputPath
    }

    for (var i = 0; i < this.transform.length; i++ ) {
        // apply browserify transform
        b.transform(this.transform[i]);
    }

    // function to be called to add transforms or any other modifications
    // a person needs to take on a browserify instance
    this.modifyBrowserify(this.cache[inputPath])

    // when a browserify dependency is detected
    b.on("dep", function(dep) {
        // turn the browserify dependency file into a relative path to match
        // the file path structure of inputPath
        var depFile = path.relative(self.curDir, dep.file);
        
        // watch file when file isn't in self.deps and not in self.cache
        if (!(depFile in self.deps) && !(depFile in self.cache)) {
            self.watcher.add(depFile);
        }

        // if the dependency file doesn't equal the inputPath and isn't 
        // already mapped to the input Path
        if (depFile !== inputPath) {
            
            if (depFile in self.deps && self.deps[depFile].indexOf(inputPath) < 0) {
                self.deps[depFile].push(inputPath);
            } else if (!(depFile in self.deps)) {
                self.deps[depFile] = [inputPath]
            }
        }
    });

    b.on("error", function(err) {
        console.error("browserify error: " + err)
    });

    // Call on browserify initialization so that browserfication happens
    // on script execution
    this.bundleShare(inputPath);
}

// function in order to modify a browserify instance 
BrowserifyDirectory.prototype.modifyBrowserify = function(cacheData) {
    return null;
}

// get the inputs browserify bundle and write it to the outputPath
BrowserifyDirectory.prototype.bundleShare = function(inputPath) {
    // input object with associated browserify instance and outputPath
    input = this.cache[inputPath];
    
    try {
        // grab bundle errors so that it can 
        input.b.bundle()
            .on("error", function(err){
                console.error(err.message)
            })
            .pipe(fs.createWriteStream(input.outputPath));

        console.log('compiled ' + path.resolve(input.outputPath));
    } catch(error) {
        console.error(error);
    }
}



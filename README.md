# Directify
Directify allows you to pass in an input directory and output directory and will browserify bundle all the files in the input directory on file change. Directify will maintain file names  Directify also watches dependencies that are outside of the input directory and will bundle the inputs files on dependency changes.


## Install
`npm install directify`

## Usage
Directify can be used either from the command line or via the API. (NOTE: If you need to use more than one transform that affects file extensions you will need to build off the API or run multiple Directify instances.)

### Command Line
```
Usage: directify [entry directory] opts

    --outfile,  -o      Write browserify bundles to this output directory.
                        Will match directory structure of input directory.
                        *This argument is required.
                    
   --transform, -t      Transform to apply to output files
   --outputExt, -e      File extension that a transform should map to (ie coffee -> js)
```
You can also include browserify options that will be passed to the browserify instance. Options should be passed as the name corresponding to the [options name](https://github.com/substack/node-browserify#user-content-methods). NOTE: Directify has not been tested with all options and therefore should be used with discretion. Directify does not support the `-e entry point` browserify option. 

### API
`var directify = require("directify")`

#### var d = new directify(opts)
Creates a directify instance d. Opts must include `inputDir` and `outputDir`. 

`opts.transform` specifies the transform that should be applied to browserify instances.

`opts.transformExtension` specifies the file extension name to change to .js if your transform needs to change file extensions (i.e. coffeeify).

`opts.browserifyOpts` is a dictionary of browserify options that should be included in all browserify instantiations. 

#### d.modifyBrowserify(inputData)
A function you can implement which allows you to modify each browserify instance. 

`inputData` is a dictionary with the following data:
```
{
    b: [browserifyInstance],
    outputPath: [output path that the browserify instance will be bundled to],
    inputPath: [input path of the browserify instance]
}
```

#### d.replaceExtension(filepath, expectedExtension, newExtension)
A convenience method provided in order to change file extension names - specifically with regards to transforms

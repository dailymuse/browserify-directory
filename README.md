# Directify
Directify allows you to pass in an input directory and output directory and will browserify bundle all the files in the input directory on file change to the output directory.   Directify also watches dependencies that are outside of the input directory and will bundle the inputs files on dependency changes.

##Inspiration
We found [watchify](https://github.com/substack/watchify) to be useful for when you need to output a single file, but not when you have many javascript files that need to be browserified into individual files. Not all pages are single page SPA's.

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
                    
   --transform, -t      Transform to apply to output files. 
                        Directify assumes that the transform can be requied.
                        
   --outputExt, -e      File extension that a transform should replace the inputPath 
                        extension with a .js extension (e.g. replacing .coffee if 
                        you are using the coffeeify transform ).
```
You can also include any browserify options that will be passed to the browserify instance. Options should be passed as the camelcase name corresponding to [options name](https://github.com/substack/node-browserify#user-content-methods) in the browserify method . 

NOTE: Directify has not been tested with all options and therefore should be used with discretion. 
Directify does not support the `-e entry point` browserify option. 

### API
`var directify = require("directify")`

#### var d = new directify(opts={inputDir: '', outputDir: ''})
Creates a directify instance d. Opts must include an `inputDir` and `outputDir`. 

`opts.transform` specifies the transform that should be applied to browserify instances.

`opts.transformExtension` specifies the file extension name to change to .js if your transform needs to change file extensions (i.e. coffeeify).

`opts.browserifyOpts` is a dictionary of browserify options that will included in all browserify instantiations.

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
A convenience method provided in order to change file extension names - specifically with regards to transforms.

## Issues
Please file any issues you find with Directify and we will try to address them. 

# Browserify-directory
Browserify-directory watches all files in a directory and browserify's them to an output directory. Update any source files and your browserify bundle will be updated on the spot. Think of browserify-directory as super charged [watchify](https://github.com/substack/watchify) - instead of watching files it watches an entire directory for changes and outputs those changed files, while mirroring the input directory hierarchy in the output directory.  

## Install
If you are using browserify directory as a cli tool:
`npm install browserify-directory -g`

## Usage
Browserify-directory can be used either from the command line or via its API. 

### Command Line
```
Usage: browserify-directory [input directory] [output directory] opts
                    
   --transform, -t      Transform to apply to output files. 
                        browserify-directory assumes that the transform can be requied.
                        
   --outputExt, -e      File extension that a transform should replace the inputPath 
                        extension with a .js extension (e.g. replacing .coffee if 
                        you are using the coffeeify transform).
```
You can also include any browserify options that will be passed to the browserify instance. Options should be passed as the camelcase name corresponding to [options name](https://github.com/substack/node-browserify#user-content-methods) in the browserify method . 

browserify-directory does not support the `-e entry point` browserify option. 

### API
`var browserify-directory = require("browserify-directory")`

#### var bd = new browserify-directory(opts={inputDir: '', outputDir: ''})
Creates a browserify-directory instance d. Opts must include an `inputDir` and `outputDir`. 

`opts.transform` specifies the transform that should be applied to browserify instances.

`opts.transformExtension` specifies the file extension name to change to .js if your transform needs to change file extensions (i.e. coffeeify).

`opts.browserifyOpts` is a dictionary of browserify options that will included in all browserify instantiations.

#### bd.modifyBrowserify(inputData)
A function you can implement which allows you to modify each browserify instance. 

`inputData` is a dictionary with the following data:
```
{
    b: [browserifyInstance],
    outputPath: [output path that the browserify instance will be bundled to],
    inputPath: [input path of the browserify instance]
}
```

#### bd.replaceExtension(filepath, expectedExtension, newExtension)
A convenience method provided in order to change file extension names - specifically with regards to transforms.

## Issues
Please file any issues you find with browserify-directory and we will try to address them. 

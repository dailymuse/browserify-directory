# Directify
Directify watches all files in a directory and browserify's them to an output directory. Update any source files and your browserify bundle will be updated on the spot. Think of directify as super charged [watchify](https://github.com/substack/watchify) - instead of watching files it watches an entire directory for changes and outputs those changed files while mirroring the input directory hierarchy in the output directory.  

## Install
`npm install directify`

## Usage
Directify can be used either from the command line or via its API. 

### Command Line
```
Usage: directify [input directory] [output directory] opts
                    
   --transform, -t      Transform to apply to output files. 
                        Directify assumes that the transform can be requied.
                        
   --outputExt, -e      File extension that a transform should replace the inputPath 
                        extension with a .js extension (e.g. replacing .coffee if 
                        you are using the coffeeify transform).
```
You can also include any browserify options that will be passed to the browserify instance. Options should be passed as the camelcase name corresponding to [options name](https://github.com/substack/node-browserify#user-content-methods) in the browserify method . 

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

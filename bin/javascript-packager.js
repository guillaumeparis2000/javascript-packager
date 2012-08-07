#!/usr/bin/env node
var watch = require('watch')
, nopt = require('nopt')
, path = require('path')
, fs = require('fs')
, uglify = require('uglify-js')
, colors = require('colors')

// exit with docs
if (process.argv.length == 2)
{
    docs();
    return;
}

// define expected options
options = {
    "path": String,
    "jsFile": String,
    "destDir": String,
    "destFile": String
}

// parse options
options = nopt(options, {}, process.argv);

doAllJsProcess();
watchForJsChanges(options.path);
/**
 * Wath for file changes in the folder given by path
 */
function watchForJsChanges(path)
{
    // Watch for file changes
    watch.createMonitor(path, function (monitor) {
        monitor.on("created", function (f, stat) {
            // Handle file changes
            console.log(f + " was created");
            doAllJsProcess();
        })
        monitor.on("changed", function (f, curr, prev) {
            // Handle new files
            console.log(f + " was changed");
            doAllJsProcess();
        })
        monitor.on("removed", function (f, stat) {
            // Handle removed files
            console.log(f + " was removed");
            doAllJsProcess();
        })
    });
}

/**
 * Get an array of the JS files that need to be processed
 */
function getJsFilesToProcess(jsConfigFile, path)
{
    var stringFiles = fs.readFileSync(jsConfigFile);

    var jsFiles = stringFiles.toString('utf8');
    var reg=new RegExp("\n", "g");
    jsFiles = jsFiles.replace(reg, '');
    jsFiles = jsFiles.split('@import: ');

    // remove first empty element
    jsFiles.shift();
    
    return jsFiles;
}

/**
 * Concatenate all the JS file
 */
function concatJsFiles(jsFiles, path)
{
    var numberFile = jsFiles.length;
    var concatenatedJs = null;
    for (var i=0; i<numberFile; i++)
    {
        concatenatedJs += fs.readFileSync(path + '/' + jsFiles[i]).toString('utf8');
    }
    return concatenatedJs;
}

/**
 * Minify the concatenated string and return it
 */
function minifyJs(concatenatedJs)
{
    var jsp = uglify.parser;
    var pro = uglify.uglify;
    
    var ast = jsp.parse(concatenatedJs); // parse code and get the initial AST
    ast = pro.ast_mangle(ast); // get a new AST with mangled names
    ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
    var final_code = pro.gen_code(ast); // compressed code here
    return final_code;
}
/**
 * Copy the concatenated file and minifyed file to the destDir
 */
function copyFinalFiles(destDir, destFile, concatenatedJs, minifyedJs)
{
    fs.writeFile(destDir + '/' + destFile + '.js', concatenatedJs, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('The '+destDir + '/' + destFile + '.js was saved!');
        }
    });

    fs.writeFile(destDir + '/' + destFile + '.min.js', minifyedJs, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('The '+destDir + '/' + destFile + '.min.js was saved!');
        }
    });

    return;
}

/**
 * Do all the javascript compilation process
 * 1- parse javascript config file
 * 2- concatenate the JS files
 * 3- minify the JS files
 * 4- write the concatenated and minifyed file
 */
function doAllJsProcess()
{
    var jsFiles = getJsFilesToProcess(options.jsFile, options.path);
    var concatenatedJs = concatJsFiles(jsFiles, options.path);
    var uncompressSize = Math.round(concatenatedJs.length/1024, 2);

    var minifyedJs = minifyJs(concatenatedJs);
    var minifiedJsSize = Math.round(minifyedJs.length/1024, 2);
	var percent = Math.round(minifiedJsSize / uncompressSize * 100, 2);

    copyFinalFiles(options.destDir, options.destFile, concatenatedJs, minifyedJs);	

    console.log("Aprox uncompressed Size: " + (uncompressSize.toString() + " KBytes").yellow + ". Compressed Size: " + (minifiedJsSize.toString() + " KBytes").yellow + ". Compression: " + (percent + "%").yellow);
}

function docs()
{
    console.log("\nGENERAL USE: " + "$".grey + "javascript-packager".cyan + " [path] ".yellow + "[jsFile] ".yellow + "[destDir] ".yellow + "[destFile] ".yellow);
	console.log("\n\n--path: path to js files");
	console.log("\n--jsFile: javascript configuration file, every importation line must start by @import: ");
	console.log("\n--destDir: destination directory for the concatenated and minifyed js files");
	console.log("\n--destFile: name of the concatenated and minifyed files withtout .js");
	console.log("\n\nEXAMPLE:");
	console.log("\njsFile:");
	console.log("\n@import: script1.js\n@import: script2.js\n...\n@import: scriptX.js");
	console.log("\n\njavascript-packager:");
	console.log("\n$".grey + "javascript-packager".cyan + "--jsFile src/js/javascript.config --destDir ../../workspace/build/src/js --destFile file".yellow);
   return;
}

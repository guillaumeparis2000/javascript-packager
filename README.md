javascript-packager
===================

Used to build javascript: it allow to make a config file for the javascripts files you want to concatenate and minify in one file.

USAGE
-----
####GENERAL USE: ####
```bash
$javascript-packager [--watch] ][--path] [--jsFile] [--destDir] [--destFile] 
```

--watch: watch the javascript folder for changes, if changes concatenate and minify the javascripts files another time

--path: path to js files

--jsFile: javascript configuration file, every importation line must start by @import: 

--destDir: destination directory for the concatenated and minifyed js files

--destFile: name of the concatenated and minifyed files withtout .js


####EXAMPLE:####

#####jsFile:#####

@import: script1.js
@import: script2.js
...
@import: scriptX.js


#####javascript-packager:#####
```bash
$javascript-packager --watch --jsFile src/js/javascript.config --destDir ../../workspace/build/src/js --destFile file
```

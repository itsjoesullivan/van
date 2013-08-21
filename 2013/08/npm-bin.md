#Defining global scripts in NPM

I've never quite known the proper way to declare a global script within an npm module. The [docs](https://npmjs.org/doc/json.html#bin) aren't exactly hazy, but I conducted a little survey, below, to grok the overall practice.  A brief wrapup follows.

##Express

The meat of the app exists in <code>./bin/express</code>, which freely requires scripts with paths relative to itself.

###[package.json](https://github.com/visionmedia/express/blob/master/package.json)
```json
"bin": {
  "express": "./bin/express"
}
```

###[./bin/express"](https://github.com/visionmedia/express/blob/master/bin/express)
```bash
#!/usr/bin/env node
# [...]
```

##Grunt
Uses precisely the same pattern as express
###[package.json](https://github.com/gruntjs/grunt-cli/blob/master/package.json)
```json
"bin": {
    "grunt": "bin/grunt"
}
```

###[bin/grunt](https://github.com/gruntjs/grunt-cli/blob/master/bin/grunt)
```bash
#!/usr/bin/env node
# [...]
```

##mocha
Mocha mixes things up a bit. "mocha" does little but execute "node ./_mocha", except when certain commands would modify node instead of mocha, i.e. "node debug _mocha". [It wasn't always that way](https://github.com/visionmedia/mocha/compare/221a3c049ed3a943ce36fd0a4ffe0e23acbb7cab...6fa9d8ae889a).

###[package.json](https://github.com/visionmedia/mocha/blob/master/package.json)
```json
  "bin": {
    "mocha": "./bin/mocha",
      "_mocha": "./bin/_mocha"
  }
```

###[./bin/mocha](https://github.com/visionmedia/mocha/blob/master/bin/mocha)
```bash
#!/usr/bin/env node
/**
 * This tiny wrapper file checks for known node flags and appends them
 * when found, before invoking the "real" _mocha(1) executable.
 */
// [...]
args = [ __dirname + '/_mocha' ]
/* [building some arguments] */
```
###[./bin/_mocha](https://github.com/visionmedia/mocha/blob/master/bin/_mocha)
```bash
#!/usr/bin/env node

/** [familiar..]
 * Module dependencies.
 */
```

##UglifyJS

Standard.

###[package.json](https://github.com/mishoo/UglifyJS/blob/master/package.json)
```json
"bin"     : {
  "uglifyjs" : "./bin/uglifyjs"
}
```

###[./bin/uglifyjs](https://github.com/mishoo/UglifyJS/blob/master/bin/uglifyjs)
```bash
#!/usr/bin/env node

[...]
```

##browserify

Similar invocation, with an interesting twist: help files are stored in <code>bin/usage.txt</code> and <code>bin/advanced.txt</code>, offering a pretty neat way to manage usage if not using commanderjs.

###package.json
```json
"bin": {
  "browserify": "bin/cmd.js"
}
```

###[bin/cmd.js](https://github.com/substack/node-browserify/blob/master/bin/cmd.js)
```bash
#!/usr/bin/env node
var fs = require('fs');
[...]
```

##jshint

jshint is the first on this list that has a one-liner bash script. Still, it invokes <code>../src/cli.js</code>.

###[package.json](https://github.com/jshint/jshint/blob/master/package.json)
```json
"bin": {
  "jshint": "./bin/jshint"
}
```

###[./bin/jshint](https://github.com/jshint/jshint/blob/master/bin/jshint)
```bash
#!/usr/bin/env node

require("../src/cli.js").interpret(process.argv);
```

###[../src/cli.js](https://github.com/jshint/jshint/blob/master/src/cli.js)
```javascript
// [...]
var OPTIONS = {
    "config": ["c", "Custom configuration file", "string", false ],
    //[...]
```

##Wrapup

1. The common method of creating a global command is to define it in <code>package.json</code> like so:

    __package.json__
    
    ```json
    "bin": {
      "{commandName}": "bin/{fileName}"
    }
    ```
    
    The [npm docs](https://npmjs.org/doc/json.html#bin) don't disagree.

2. That script then does the CLI-oriented stuff

    __bin/{fileName}__

    ```bash
    #!/usr/bin/env node
    var program = require('commander');
    program.parse(process.argv);
    ```

3. The script can require files from its package using paths relative to itself

    __bin/{fileName}__

    ```bash
    #!/usr/bin/env node
    var tool = require('../lib/tool');
    ```

4. To easily surface usage/help messages, simply write then as .txt files à la browserify:
    
    __bin/{fileName}__

    ```bash
    #!/usr/bin/env node
      return fs.createReadStream(__dirname + '/advanced.txt')
        .pipe(process.stdout)
        .on('close', function () { process.exit(1) })
      ;
    ```

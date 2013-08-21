#Defining binaries in NPM

I've never quite known how to properly create global apps. A brief survey of how other people have done so follows.

##Express

###package.json
```json
"bin": {
  "express": "./bin/express"
}
```

###./bin/express"

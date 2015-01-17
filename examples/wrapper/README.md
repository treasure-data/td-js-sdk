# Wrapper

Use this as a reference if you wish to wrap and redistribute td-js-sdk.

In this example, we will pretend we are a company called Example. We want the JS SDK to use the global variable `Example`, and have it forward all events to `in.example.com`.


## Running

* `npm install`
* `npm start`
* `npm run dev`
* `open http://localhost:3000`


## File information

* `lib/index.js` - wrapper library with comments
* `lib/loader.js` - async loader
* `gulpfile.js` - build tasks
* `index.html` - usage example of the wrapper


## Tasks

* `npm start` - runs build and loader tasks
* `npm run build` - compile and output original and minified library to dist
* `npm run loader` - compile and output original and minified loader to dist, set environment variables `URL` and `SDK_GLOBAL` to overwrite default
* `npm run dev` - runs file server for this folder using port 3000

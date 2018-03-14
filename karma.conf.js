// Karma configuration
var browserlist = require('./saucelist.json')
var build = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      require.resolve('js-polyfills/es5.js'),
      { pattern: 'lib/**/*.js', included: false },
      { pattern: 'test/*.spec.js', included: true, watched: false }
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.spec.js': ['webpack']
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['min', 'saucelabs'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: false,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    sauceLabs: {
      testName: 'td-js-sdk',
      build: build,
      recordVideo: true,
      connectOptions: {
        // retry to establish a tunnel multiple times
        connectRetries: 3,
        // time to wait between connection retries in ms
        connectRetryTimeout: 2000
      }
    },
    // Allocating a browser can take pretty long (eg. if we are out of capacity and need to wait
    // for another build to finish) and so the `captureTimeout` typically kills
    // an in-queue-pending request, which makes no sense.
    captureTimeout: 0,
    // Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs
    browserNoActivityTimeout: 120000,

    // Define browsers
    customLaunchers: browserlist,

    // Run them all
    browsers: Object.keys(browserlist),

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5
  })
}

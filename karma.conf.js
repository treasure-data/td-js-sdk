module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // Allocating a browser can take pretty long (eg. if we are out of capacity and need to wait
    // for another build to finish) and so the `captureTimeout` typically kills
    // an in-queue-pending request, which makes no sense.
    captureTimeout: 120000,

    // Increase default browser timeout for when
    // devices or emulators take a while to boot up
    browserNoActivityTimeout: 120000,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'lib/**/*.js', included: false },
      { pattern: 'test/*.spec.js', included: true, watched: false }
    ],

    esbuild: {
      singleBundle: true,
      define: {
        global: 'window'
      }
    },

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.spec.js': ['esbuild']
    },

    client: {
      mocha: {
        timeout: 5000
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: false,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5
  })
}

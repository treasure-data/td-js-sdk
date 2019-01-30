// Karma configuration
var browserlist = require('./browserlist.json')
var branch = process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH
var sha = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()
var startTime = new Date().toISOString()

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
    reporters: ['min', 'BrowserStack'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: false,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    browserStack: {
      project: branch === 'master' ? 'td-js-sdk' : 'td-js-sdk-dev',
      build: `${sha} ${startTime}`,
      startTunnel: false
    },

    // define browsers
    customLaunchers: browserlist,

    browsers: [
      'bs_firefox_latest_mac',
      'bs_chrome_latest_mac',
      'bs_safari_7_mac',
      'bs_safari_8_mac',
      'bs_safari_9_mac',
      'bs_safari_10_mac',
      'bs_safari_11_mac',
      'bs_ie_8_win',
      'bs_ie_9_win',
      'bs_ie_10_win',
      'bs_ie_11_win',
      'bs_edge_latest_win'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5
  })
}

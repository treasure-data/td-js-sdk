// Karma configuration
var browserlist = require('./browserlist.json')
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
    reporters: ['min'],

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
      project: 'td-js-sdk',
      build: build,
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
      'bs_edge_latest_win',
      'bs_iphone5',
      'bs_iphone6',
      'bs_iphone6_9',
      'bs_iphone7',
      'bs_iphone8',
      'android44',
      'android50',
      'android60',
      'android71'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5
  })
}

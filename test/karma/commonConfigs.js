var branch = process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH
var sha = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()

var startTime = new Date().toISOString()
var launchers = require('./launchers')

var baseConfigs = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '../..',

  // Allocating a browser can take pretty long (eg. if we are out of capacity and need to wait
  // for another build to finish) and so the `captureTimeout` typically kills
  // an in-queue-pending request, which makes no sense.
  captureTimeout: 240000,

  // Increase default browser timeout for when
  // devices or emulators take a while to boot up
  browserNoActivityTimeout: 240000,

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

  // enable / disable colors in the output (reporters and logs)
  colors: false,

  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: false,

  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: true,

  // Concurrency level
  // how many browser should be started simultaneous
  concurrency: 5,

  browserStack: {
    project: branch === 'master' ? 'td-js-sdk' : 'td-js-sdk-dev',
    build: `${sha} ${startTime}`,
    startTunnel: false
  },

  // define browsers
  customLaunchers: launchers
}

module.exports = function buildKarmaConfigs (config) {
  config.set(baseConfigs)
  config.set({
    logLevel: config.LOG_INFO
  })
}

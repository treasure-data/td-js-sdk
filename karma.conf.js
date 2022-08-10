var branch = process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH
var sha = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()
var startTime = new Date().toISOString()

var webpackConfig = require('./webpack.config')
webpackConfig.entry = undefined
webpackConfig.mode = 'development'

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
      require.resolve('@babel/polyfill/dist/polyfill.js'),
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

    webpack: webpackConfig,

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'BrowserStack'],

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
    customLaunchers: {
      bs_firefox_latest_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        os: 'OS X',
        os_version: 'Catalina'
      },
      bs_firefox_latest_win: {
        base: 'BrowserStack',
        browser: 'firefox',
        os: 'Windows',
        os_version: '10'
      },

      bs_chrome_latest_mac: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'OS X',
        os_version: 'Catalina'
      },
      bs_chrome_latest_win: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'Windows',
        os_version: '10'
      },

      bs_safari_latest_mac: {
        base: 'BrowserStack',
        browser: 'Safari',
        os: 'OS X',
        os_version: 'Catalina'
      },

      bs_edge_latest_win: {
        base: 'BrowserStack',
        browser: 'edge',
        os: 'Windows',
        os_version: '10'
      },

      bs_iphone_X: {
        base: 'BrowserStack',
        device: 'iPhone X',
        browser: 'safari',
        os: 'iOS',
        os_version: '11',
        real_mobile: true
      },

      bs_iphone_11: {
        base: 'BrowserStack',
        device: 'iPhone 11',
        browser: 'safari',
        os: 'iOS',
        os_version: '15',
        real_mobile: true
      },
      bs_iphone_XS: {
        base: 'BrowserStack',
        device: 'iPhone XS',
        browser: 'safari',
        os: 'iOS',
        os_version: '12',
        real_mobile: true
      },

      bs_android_pixel: {
        base: 'BrowserStack',
        device: 'Google Pixel',
        browser: 'chrome',
        os: 'android',
        os_version: '8.0',
        real_mobile: true
      },

      bs_android_pixel_3: {
        base: 'BrowserStack',
        device: 'Google Pixel 3',
        browser: 'chrome',
        os: 'android',
        os_version: '9.0',
        real_mobile: true
      },

      bs_android_pixel_4: {
        base: 'BrowserStack',
        device: 'Google Pixel 4',
        browser: 'chrome',
        os: 'android',
        os_version: '10.0',
        real_mobile: true
      },

      bs_android_pixel_5: {
        base: 'BrowserStack',
        device: 'Google Pixel 5',
        browser: 'chrome',
        os: 'android',
        os_version: '11.0',
        real_mobile: true
      },

      bs_android_samsung_galaxy_A51: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy A51',
        browser: 'chrome',
        os: 'android',
        os_version: '10.0',
        real_mobile: true
      },

      bs_android_samsung_galaxy_note10: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy Note 10',
        browser: 'chrome',
        os: 'android',
        os_version: '9.0',
        real_mobile: true
      }

    },

    browsers: [
      'bs_firefox_latest_mac',
      'bs_chrome_latest_mac',
      'bs_safari_latest_mac',
      'bs_edge_latest_win',
      'bs_iphone_X',
      'bs_iphone_11',
      'bs_iphone_XS',
      'bs_android_pixel',
      'bs_android_pixel_3',
      'bs_android_pixel_4',
      'bs_android_pixel_5',
      'bs_android_samsung_galaxy_A51',
      'bs_android_samsung_galaxy_note10'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5
  })
}

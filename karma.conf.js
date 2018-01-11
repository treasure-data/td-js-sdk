// Karma configuration
// Generated on Tue Oct 03 2017 21:21:19 GMT-0500 (CDT)

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
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'test/*.spec.js', included: true, watched: false}
    ],

    // list of files to exclude
    exclude: [
    ],

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
      startTunnel: false
    },

    // define browsers
    customLaunchers: {
      bs_firefox_latest_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_chrome_latest_mac: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_safari_7_mac: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '7.1',
        os: 'OS X',
        os_version: 'Mavericks'
      },
      bs_safari_8_mac: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '8.0',
        os: 'OS X',
        os_version: 'Yosemite'
      },
      bs_safari_9_mac: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '9.1',
        os: 'OS X',
        os_version: 'El Capitan'
      },
      bs_safari_10_mac: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '10.0',
        os: 'OS X',
        os_version: 'Sierra'
      },
      bs_safari_11_mac: {
        base: 'BrowserStack',
        browser: 'safari',
        browser_version: '11.0',
        os: 'OS X',
        os_version: 'High Sierra'
      },
      bs_ie_8_win: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '8.0',
        os: 'Windows',
        os_version: '7'
      },
      bs_ie_9_win: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '9.0',
        os: 'Windows',
        os_version: '7'
      },
      bs_ie_10_win: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '10.0',
        os: 'Windows',
        os_version: '8'
      },
      bs_ie_11_win: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_edge_latest_win: {
        base: 'BrowserStack',
        browser: 'edge',
        os: 'Windows',
        os_version: '10'
      }
    },

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

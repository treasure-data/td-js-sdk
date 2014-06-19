module.exports = function(config) {
  'use strict';
  var configuration = {

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 20000,

    frameworks: ['mocha', 'sinon-chai'],

    // plugins
    plugins: ['karma-mocha', 'karma-sinon-chai', 'karma-phantomjs-launcher'],

    // list of files / patterns to load in the browser
    files: [
      'dist/td-js-sdk.js',
      'test/treasure.helper.js',
      'test/*.spec.js'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters: ['progress'],

    // web server port
    port: 9876,

    logLevel: 'INFO',

    // cli runner port
    runnerPort: 9100,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    // SauceLabs configuration
    sauceLabs: {
      testName: 'td-js-sdk',
      startConnect: false,
      build: process.env.CIRCLE_BUILD_NUM,
      tunnelIdentifier: process.env.CI ? process.env.CIRCLE_BUILD_NUM : null,
      username: process.env.SAUCE_USERNAME || process.env.JS_SDK_SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY || process.env.JS_SDK_SAUCE_ACCESS_KEY
    }

  };

  if (config) {
    config.set(configuration);
  } else {
    return configuration;
  }
};



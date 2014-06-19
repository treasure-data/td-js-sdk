module.exports = function(config) {
  'use strict';
  var configuration = {

    frameworks: ['mocha', 'sinon-chai'],

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

    // enable / disable colors in the output (reporters and logs)
    colors: true,

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
    singleRun: false

  };

  if (config) {
    config.set(configuration);
  } else {
    return configuration;
  }
};



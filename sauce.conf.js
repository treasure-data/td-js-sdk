'use strict';

module.exports = {
  connect: {
    username: process.env.SAUCE_USERNAME || process.env.JS_SDK_SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY || process.env.JS_SDK_SAUCE_ACCESS_KEY,
    verbose: false,
    logfile: null,
    tunnelIdentifier: process.env.CI ? process.env.TRAVIS_JOB_ID : null,
    fastFailRexegps: null,
    directDomains: null,
    logger: console.log
  },
  karma: {
    captureTimeout: 0,
    transports: ['xhr-polling'],
    singleRun: true,
    browsers: [],
    customLaunchers: {},
    plugins: ['karma-mocha', 'karma-sinon-chai', 'karma-sauce-launcher'],
    reporters: ['dots', 'saucelabs']
  },
  concurrency: 3,
  browsers: [{
    browserName: 'opera',
    platform: 'Windows 7',
    version: '12'
  }, {
    browserName: 'opera',
    platform: 'Windows XP',
    version: '11'
  }, {
    browserName: 'firefox',
    platform: 'Linux',
    version: '31'
  }, {
    browserName: 'firefox',
    platform: 'Windows 8.1',
    version: '31'
  }, {
    browserName: 'chrome',
    platform: 'OS X 10.9',
    version: ''
  }, {
    browserName: 'chrome',
    platform: 'Windows 8.1',
    version: ''
  }, {
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7'
  }, {
    browserName: 'safari',
    platform: 'OS X 10.8',
    version: '6'
  }, {
    browserName: 'safari',
    platform: 'OS X 10.6',
    version: '5'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10'
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9'
  }]
};
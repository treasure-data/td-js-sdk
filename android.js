var buildKarmaConfig = require('./commonConfigs')

var branch = process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH
var sha = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()

var startTime = new Date().toISOString()

module.exports = function (config) {
  buildKarmaConfig(config)

  config.set({
    port: 9876,
    browsers: [
      'android44',
      'android50',
      'android60',
      'android71',
      'android80',
      'android90',
      'android100'
    ],
    browserStack: {
      project: branch === 'master' ? 'td-js-sdk-android' : 'td-js-sdk-dev-android',
      build: `${sha} ${startTime}`,
      startTunnel: false
    }
  })
}

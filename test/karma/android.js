var buildKarmaConfig = require('./commonConfigs')

module.exports = function (config) {
  buildKarmaConfig(config)

  var currentBrowserStack = config.browserStack
  currentBrowserStack.project = currentBrowserStack.project + '-android'

  config.set({
    port: 9876,

    browserStack: currentBrowserStack,

    browsers: [
      'android44',
      'android50',
      'android60',
      'android71',
      'android80',
      'android90',
      'android100'
    ]
  })
}

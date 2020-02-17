
var buildKarmaConfig = require('./commonConfigs')

module.exports = function (config) {
  buildKarmaConfig(config)

  var currentProject = config.browserStack.project

  config.set({
    port: 9874,

    browserStack: {
      project: currentProject + '-safari'
    },

    browsers: [
      'bs_safari_7_mac',
      'bs_safari_8_mac',
      'bs_safari_9_mac',
      'bs_safari_10_mac',
      'bs_safari_11_mac',
      'bs_safari_12_mac',
      'bs_safari_13_mac'
    ]
  })
}

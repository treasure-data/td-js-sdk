
var buildKarmaConfig = require('./commonConfigs')

module.exports = function (config) {
  buildKarmaConfig(config)

  var currentProject = config.browserStack.project

  config.set({
    port: 9875,

    browserStack: {
      project: currentProject + '-ie-edge'
    },

    browsers: [
      'bs_ie_8_win',
      'bs_ie_9_win',
      'bs_ie_10_win',
      'bs_ie_11_win',
      'bs_edge_latest_win'
    ]
  })
}

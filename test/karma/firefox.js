var buildKarmaConfig = require('./commonConfigs')

module.exports = function (config) {
  buildKarmaConfig(config)

  var currentProject = config.browserStack.project

  config.set({
    port: 9873,

    browserStack: {
      project: currentProject + '-firefox'
    },

    browsers: [
      'bs_firefox_latest_mac'
    ]
  })
}

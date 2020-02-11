var buildKarmaConfig = require('./commonConfigs')

module.exports = function (config) {
  buildKarmaConfig(config)

  var currentProject = config.browserStack.project

  config.set({
    port: 9872,

    browserStack: {
      project: currentProject + '-chrome'
    },

    browsers: [
      'bs_chrome_latest_mac'
    ]
  })
}

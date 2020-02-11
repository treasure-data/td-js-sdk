var buildKarmaConfig = require('./commonConfigs')
module.exports = function (config) {
  buildKarmaConfig(config)

  var currentProject = config.browserStack.project

  config.set({
    port: 9871,

    browserStack: {
      project: currentProject + '-ios'
    },

    browsers: [
      'bs_iphone5',
      'bs_iphone6',
      'bs_iphone6_9',
      'bs_iphone8'
    ]
  })
}

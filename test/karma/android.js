var buildKarmaConfig = require('./commonConfigs')

module.exports = function (config) {
  buildKarmaConfig(config)

  var currentProject = config.browserStack.project

  config.set({
    port: 9870,

    browserStack: {
      project: currentProject + '-android'
    },

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

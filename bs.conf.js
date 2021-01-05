let browserstack = require('browserstack-local')
let baseConfig = require('./wdio.conf').config
let bsCapabilities = require('./capabilities').BROWSERSTACK

let browserstackConfig = {
  ...baseConfig,
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  capabilities: bsCapabilities,

  onPrepare: function () {
    console.log('Connecting browserstack local')
    return new Promise(function (resolve, reject) {
      exports.bs_local = new browserstack.Local()
      exports.bs_local.start(
        {
          key: exports.config.key
        },
        function (error) {
          if (error) return reject(error)
          console.log('Connected. Now testing...')

          resolve()
        }
      )
    })
  },

  onComplete: function () {
    console.log('Stopping browserstack local')
    if (exports.bs_local && exports.bs_local.pid) {
      process.kill(exports.bs_local.pid)
    } else {
      exports.bs_local.stop(() => {})
    }
  }
}

exports.config = browserstackConfig

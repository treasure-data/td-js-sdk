var browserstack = require('browserstack-local')
var browserlist = Object.values(require('./browserlist.json'))
var args = process.argv.slice(2)
var local = args.includes('--local')

var build = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()

var services = local
  ? ['selenium-standalone', 'static-server']
  : ['browserstack', 'selenium-standalone', 'static-server']

var capabilities = local ? [{
  browserName: 'chrome'
}] : browserlist.map(function (browser) {
  return Object.assign({}, browser, {
    'browserstack.local': true,
    project: 'td-js-sdk',
    build: build
  })
})

var localConfig = {
  host: 'localhost'
}

var browserstackConfig = {
  host: 'hub.browserstack.com',
  user: process.env.BROWSER_STACK_USERNAME,
  key: process.env.BROWSER_STACK_ACCESS_KEY,
  // Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log('Connecting local')
    return new Promise(function (resolve, reject) {
      exports.bs_local = new browserstack.Local()
      exports.bs_local.start({ 'key': exports.config.key }, function (error) {
        if (error) return reject(error)
        console.log('Connected. Now testing...')
        resolve()
      })
    })
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    exports.bs_local.stop(function () {})
  }
}

exports.config = Object.assign({}, {
  capabilities: capabilities,
  services: services,
  specs: [
    './test/new-e2e/*.js'
  ],
  staticServerFolders: [
    { mount: '/fixtures', path: './test/fixtures' },
    { mount: '/dist', path: './test/dist' },
    { mount: '/assets', path: './test/assets' }
  ],
  maxInstances: 5,
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  deprecationWarnings: true,
  bail: 0,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  },
  staticServerPort: 1337
}, local ? localConfig : browserstackConfig)

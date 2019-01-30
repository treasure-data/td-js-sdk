var browserlist = Object.values(require('./browserlist.json'))
var args = process.argv.slice(2)
var local = args.includes('--local')

var branch = process.env.TRAVIS_PULL_REQUEST_BRANCH || process.env.TRAVIS_BRANCH
var sha = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString().trim()
var startTime = new Date().toISOString()

var services = local
  ? ['selenium-standalone', 'static-server']
  : ['browserstack', 'selenium-standalone', 'static-server']

var capabilities = local
  ? [
    {
      browserName: 'chrome'
    }
  ]
  : browserlist.map(function (browser) {
    return Object.assign({}, browser, {
      'browserstack.local': true,
      project: branch === 'master' ? 'td-js-sdk' : 'td-js-sdk-dev',
      build: `${sha} ${startTime}`
    })
  })

var localConfig = {
  host: 'localhost'
}

var browserstackConfig = {
  host: 'hub.browserstack.com',
  user: process.env.BROWSER_STACK_USERNAME,
  key: process.env.BROWSER_STACK_ACCESS_KEY,
  browserstackLocal: true
}

exports.config = Object.assign(
  {},
  {
    capabilities: capabilities,
    services: services,
    specs: ['./test/e2e/*.js'],
    staticServerFolders: [
      { mount: '/fixtures', path: './test/fixtures' },
      { mount: '/dist', path: './test/dist' },
      { mount: '/assets', path: './test/assets' }
    ],
    maxInstances: 2,
    async: true,
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
      ui: 'bdd',
      timeout: 30000
    },
    staticServerPort: 1337
  },
  local ? localConfig : browserstackConfig
)

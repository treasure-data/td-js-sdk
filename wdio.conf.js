var browserlist = Object.entries(require('./browserlist.json'))
var args = process.argv.slice(2)
var local = args.includes('--local')

var services = local ?
  ['selenium-standalone', 'static-server'] :
  ['browserstack','selenium-standalone','static-server']

var capabilities = local ? [{
        browserName: 'chrome'
    }] : browserlist

exports.config = {
    capabilities: capabilities,
    services: services,
    specs: [
        './test/new-e2e/*.js'
    ],
    staticServerFolders: [
      { mount: '/fixtures', path: './test/fixtures' },
      { mount: '/dist', path: './test/dist' },
      { mount: '/assets', path: './test/assets' },
    ],
    maxInstances: 2,
    sync: true,
    logLevel: 'error',
    coloredLogs: true,
    deprecationWarnings: true,
    bail: 0,
    screenshotPath: './errorShots/',
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd'
    },
}

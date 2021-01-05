var sha = require('child_process')
  .execSync('git rev-parse --short=9 HEAD', { cwd: __dirname })
  .toString()
  .trim()

var startTime = new Date().toISOString()

let common = {
  acceptSslCerts: true,
  acceptInsecureCerts: true,
  'browserstack.local': true,
  project: 'td-js-sdk-e2e',
  build: `${sha} ${startTime}`
}

exports.BASE = [
  {
    browserName: 'chrome',
    ...common
  }
]

var browserstackCapalities = [
  {
    browserName: 'Chrome',
    os: 'Windows'
  },
  {
    browserName: 'Firefox',
    os: 'Windows'
  },
  {
    browserName: 'Firefox',
    os_version: 'High Sierra',
    os: 'OS X'
  },
  {
    browserName: 'Chrome',
    os_version: 'High Sierra',
    os: 'OS X'
  },
  {
    browserName: 'Safari',
    os_version: 'High Sierra',
    os: 'OS X'
  },
  {
    browserName: 'IE',
    browser_version: '11',
    os: 'Windows'
  },
  {
    browserName: 'Safari',
    os_version: 'Mavericks',
    os: 'OS X'
  },
  {
    browserName: 'Safari',
    os_version: 'Yosemite',
    os: 'OS X'
  },
  {
    browserName: 'Safari',
    os_version: 'El Capitan',
    os: 'OS X'
  },
  {
    browserName: 'Safari',
    os_version: 'Sierra',
    os: 'OS X'
  },
  {
    browserName: 'Edge',
    os: 'Windows',
    os_version: '10'
  },
  {
    browserName: 'iPhone',
    device: 'iPhone 6',
    os_version: '8'
  },
  {
    browserName: 'iPhone',
    device: 'iPhone 6S',
    os_version: '9'
  },
  {
    browserName: 'iPhone',
    device: 'iPhone 7',
    os_version: '10',
    real_mobile: 'true'
  },
  {
    browserName: 'iPhone',
    device: 'iPhone 8',
    os_version: '11',
    real_mobile: 'true'
  },
  {
    browserName: 'Android',
    device: 'Google Nexus 6',
    os_version: '6.0',
    real_mobile: 'true'
  },
  {
    browserName: 'Android',
    device: 'Google Pixel',
    os_version: '7.1',
    real_mobile: 'true'
  },
  {
    browserName: 'Android',
    device: 'Google Pixel',
    os_version: '8.0',
    real_mobile: 'true'
  }
]

browserstackCapalities = browserstackCapalities.map(cap => {
  return {
    ...cap,
    ...common
  }
})

exports.BROWSERSTACK = browserstackCapalities

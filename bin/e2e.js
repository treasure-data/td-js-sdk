#!/usr/bin/env node

var Launcher = require('@wdio/cli').default
var glob = require('glob')
var fs = require('fs')
var server = require('./server')

require('dotenv').config()

var HOST_PLACEHOLDER = '{host}'
var LOCALHOST = '127.0.0.1'
var BROWSERSTACK_HOST = 'bs-local.com'
var TEST_BASE_PAGE = 'test/pageobjects/page.js'

function replaceTdInfo (database, host, apiKey) {
  var files = glob.sync('test/fixtures/**/*.html')
  files.forEach(fileName => {
    var data = fs.readFileSync(fileName, 'utf-8')
    var replacedData = data
      .replace(/database:.*'/g, `database: '${database}'`)
      .replace(/host:.*'/g, `host: '${host}'`)
      .replace(/writeKey:.*'/g, `writeKey: '${apiKey}'`)

    fs.writeFileSync(fileName, replacedData, 'utf-8')
  })
}

function markTdInfo () {
  console.log('Marking information...')
  replaceTdInfo('xxxxxxxxxx', 'xxxxxxxxxx', 'xxxxxxxxxx')
}

function changeHost (host) {
  console.log(`Testing for ${host}`)
  var files = glob.sync(TEST_BASE_PAGE)
  files.forEach(fileName => {
    var data = fs.readFileSync(fileName, 'utf-8')
    var replacedData = data.replace(/{host}/g, host)

    fs.writeFileSync(fileName, replacedData, 'utf-8')
  })
}

function resetHost () {
  var files = glob.sync(TEST_BASE_PAGE)
  files.forEach(fileName => {
    var data = fs.readFileSync(fileName, 'utf-8')
    var replacedData = data
      .replace(BROWSERSTACK_HOST, HOST_PLACEHOLDER)
      .replace(LOCALHOST, HOST_PLACEHOLDER)

    fs.writeFileSync(fileName, replacedData, 'utf-8')
  })
}

var args = process.argv
if (args.length <= 2) {
  console.error('Missing arguments: base or bs')
  process.exit(1)
}

var env = args[2]

var isBrowserStack = env === 'bs'
var configFile = isBrowserStack ? 'bs.conf.js' : 'wdio.conf.js'

if (isBrowserStack) {
  // change to bs-local.com
  changeHost(BROWSERSTACK_HOST)
} else {
  changeHost(LOCALHOST)
}

const wdio = new Launcher(configFile)
server.listen(5000, runTests)

function runTests () {
  console.log('Preparing information...')
  let {
    database,
    tdHost,
    apiKey
  } = process.env

  replaceTdInfo(database, tdHost, apiKey)

  console.log('Testing...')
  wdio.run()
    .then(
      code => {
        markTdInfo()
        resetHost()
        process.exit(code)
      },
      error => {
        console.error('Failed to launch the runner', error.stacktrace)
        markTdInfo()
        resetHost()
        process.exit(1)
      }
    )
}

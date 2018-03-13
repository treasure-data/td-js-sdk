#!/usr/bin/env node

var path = require('path')
var express = require('express')
var TEST_LOCATION = path.resolve(__dirname, '../test')

var app = module.exports = express()
app.use(express.static(TEST_LOCATION))
app.use(callbackMiddleware)

// Respond 400 {error: true} when url contains callback and error
// Respond 200 {created: true} when url contains callback without error
function callbackMiddleware (req, res, next) {
  if (req.url.indexOf('callback') === -1) {
    next()
  } else if (req.url.indexOf('error') === -1) {
    res.status(200).jsonp({ created: true })
  } else {
    res.status(400).jsonp({ error: true })
  }
}

var PORT = process.env.ZUUL_PORT || 9999
if (require.main === module) {
  app.listen(PORT, function () {
    if (!process.env.CI) {
      console.log('Listening on port: ' + PORT)
      console.log('Open localhost:' + PORT + '/fixtures/')
    }
  })
}

var expect = require('expect.js')

describe('amd', function () {
  it('should be compatible with require.js', function () {
    browser.url('http://localhost:1337/fixtures/amd/index.html')
    browser.waitUntil(function () {
      return browser.getText('#status') === 'success'
    }, 5000, 'expected TD status to be success after 5s');
    browser.waitUntil(function () {
      return browser.getText('#rjs') === 'success'
    }, 5000, 'expected Require.js status to be success after 5s');
  })
})

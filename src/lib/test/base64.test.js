var Buffer = require('buffer').Buffer
var test = require('tape-catch')
var base64 = require('../base64')

test('base64.encode', function (t) {
  t.plan(2)

  var complex = '{"Приве́т नमस्ते שָׁלוֹם":"Приве́т नमस्ते שָׁלוֹם"}'
  t.equal(base64.encode(complex), new Buffer(complex).toString('base64'))

  var languages = '中文 español deutsch English हिन्दी العربية português বাংলা русский 日本語 ਪੰਜਾਬੀ 한국어 தமிழ் עברית'
  t.equal(base64.encode(languages), new Buffer(languages).toString('base64'))
})

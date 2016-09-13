var Buffer = require('buffer').Buffer
var test = require('tape-catch')
var toBase64 = require('../toBase64')

test('toBase64', function (t) {
  t.plan(2)

  var complex = '{"Приве́т नमस्ते שָׁלוֹם":"Приве́т नमस्ते שָׁלוֹם"}'
  t.equal(toBase64(complex), new Buffer(complex).toString('base64'))

  var languages = '中文 español deutsch English हिन्दी العربية português বাংলা русский 日本語 ਪੰਜਾਬੀ 한국어 தமிழ் עברית'
  t.equal(toBase64(languages), new Buffer(languages).toString('base64'))
})

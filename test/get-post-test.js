const test = require('tap').test
const mediumUrl =
  'https://medium.com/heneise/going-serverless-without-serverless-fcd5dd43ac86'
const fn = require('../lib/get-post')

test('get-post() should fail without url', async assert => {
  try {
    await fn()
    assert.fail()
  } catch (err) {
    assert.equal(err.message, 'no url or not a medium.com url')
  }
  assert.end()
})

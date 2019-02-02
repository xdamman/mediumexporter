const test = require('tap').test
const mediumUrl = 'https://medium.com/testuser/testpost-123'
const sinon = require('sinon')
const fs = require('fs')
const path = require('path')
const proxyquire = require('proxyquire')
const r2Stub = sinon
  .stub()
  .withArgs(mediumUrl)
  .returns({
    text: fs.readFileSync(
      path.join(process.env.PWD, 'test', 'testpost.json'),
      'utf8'
    )
  })
const fsStub = sinon.stub()
const fn = proxyquire('../lib/utils', {
  fs: fsStub,
  r2: { get: r2Stub }
})

test('loadMediumPost(url) should return proper json from medium post', async assert => {
  try {
    const actual = await fn.loadMediumPost(mediumUrl)
    assert.equal(actual.success, true, 'should be successful')
    assert.equal(
      actual.payload.value.title,
      'Going Serverless, without serverless.',
      'title should match'
    )
  } catch (err) {
    console.log(err)
  }
  assert.end()
})

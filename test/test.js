const http = require('http')
const fetch = require('node-fetch')
const { URL, URLSearchParams } = require('url') // node 8.x support
const assert = require('assert')
const FormData = require('form-data')
// any ENV will need to be applied to mocha too...
const config = require('../config/core')
const lokinet = require('loki-launcher/lokinet')

let weStartedPomfServer = false
const ensurePomfServer = () => {
  return new Promise((resolve, rej) => {
    console.log('pomf port', config.PORT)
    lokinet.portIsFree(config.IFACES, config.PORT, function(free) {
      if (free) {
        const app = require('../app')
        var server = http.createServer(app)
        server.listen(config.PORT, config.IFACES)
        weStartedPomfServer = true
      } else {
        console.log('detected running overlay server testing that')
      }
      resolve()
    })
  })
}

describe('#files', async () => {
  it('make sure we have something to test', async () => {
    await ensurePomfServer()
  })
  it('make sure database is ready', async () => {
    const result = await fetch(config.URL)
    const response = await result.text()
  })
  let url
  const testData = '{ "this": "is a string of json" }'
  it('file upload', async () => {

    const formData = new FormData()
    const buffer = Buffer.from(testData)
    formData.append('files[]', buffer, {
      contentType: 'application/octet-stream',
      name: 'files[]',
      filename: 'attachment',
    })
    const result = await fetch(config.UPLOAD_URL+'/upload', {
      method: 'POST',
      body: formData
    })
    const response = await result.json()
/*
response { success: true,
  files:
   [ { name: 'attachment',
       url: '/f/nmglm3',
       size: 33,
       hash: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
       mimetype: 'application/octet-stream' } ] }
*/
    //console.log('response', response)
    assert.ok(response.success)
    assert.equal(1, response.files.length)

    url = response.files[0].url
    // console.log('url', url)
    if (!url.match('://')) {
      // relative URL, so prepend base URL
      url = config.URL + url
    }
  })
  if (url) {
    it('file download', async() => {
      const result = await fetch(url)
      const response = await result.text()
      // response { "this": "is a string of json" }
      //console.log('response', response)
      assert.equal(testData, response)
    })
  } else {
    console.warn('skipping download test because upload test failed')
  }
})

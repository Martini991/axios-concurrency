import assert from 'node:assert'
import http from 'node:http'

import axios from 'axios'

import { ConcurrencyManager } from './index.js'

const PORT = 3333

const exit = (status) => {
  if (status) console.log('Tests successful')
  if (!status) console.log('Tests failed')
  process.exit(+!status)
}

const randomInteger = () => Math.floor(Math.random() * 2000 + 100)
const sequence = (n) => {
  let seq = []
  for (let i = 0; i < n; i++) {
    seq.push(i)
  }
  return seq
}

const wrapPromise = (promise) => {
  return promise.then(
    (result) => ({ result, success: true }),
    (error) => ({ result: error, success: false }),
  )
}

const api = axios.create({
  baseURL: `http://localhost:${PORT}`,
})

const MAX_CONCURRENT_REQUESTS = 5
const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS)

const server = http.createServer((request, response) => {
  if (request.url === '/fail') {
    response.writeHead(400, { 'Content-Type': 'application/json' })
    return response.end(JSON.stringify({ errorCode: 400 }))
  }

  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ randomInteger: randomInteger() }))
})

server.listen(PORT, (error) => {
  if (error) {
    return console.log(`can't create test server on localhost port ${PORT}`, error)
  }

  setTimeout(() => {
    console.error('Some requests got stuck.')
    exit(false)
  }, 1000)

  // Test many simultaneous requests
  Promise.all(sequence(40).map(() => api.get('/test')))
    .then((responses) => {
      return responses.map((response) => response.data)
    })
    .then((objects) => {
      assert(objects.length === 40)
      for (const obj of objects) {
        assert(typeof obj.randomInteger === 'number')
      }
    })

    // Test sequence of failed and success responses. Check that errors are processed as expected
    .then(() =>
      Promise.all(
        sequence(6)
          .map(() => wrapPromise(api.get('/fail')))
          .concat(sequence(4).map(() => wrapPromise(api.get('/test')))),
      ),
    )
    .then((responses) => {
      assert(responses.length === 10)
      for (const response of responses.slice(0, 6)) {
        assert(response.success === false)
        assert(response.result.response.data.errorCode === 400)
      }
      for (const response of responses.slice(6)) {
        assert(response.success === true)
        assert(typeof response.result.data.randomInteger === 'number')
      }
    })

    // Test after detaching manager
    .then(() => {
      manager.detach()
      return Promise.all(sequence(40).map(() => api.get('/test')))
    })
    .then((responses) => {
      return responses.map((response) => response.data)
    })
    .then((objects) => {
      for (const obj of objects) {
        assert(typeof obj.randomInteger === 'number')
      }
    })
    .then(() => exit(true))
    .catch((error) => {
      console.error(error)
      exit(false)
    })
})

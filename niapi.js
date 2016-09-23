#!/usr/bin/env node

'use strict'

exports.create = create

const clientRequest = require('client-request')

// Create a new API instance.
//    niapi.create({host: 'localhost', port: 9229}) // those are the defaults
//    niapi.create({url: 'http://localhost:9229'})  // that is the default
function create (options) {
  const nOptions = {}

  const host = (options.host != null) ? options.host : 'localhost'
  const port = (options.port != null) ? options.port : 9229

  if (options.url == null) {
    nOptions.url = `http://${host}:${port}`
  }

  return new Niapi(nOptions)
}

// Manages a node --inspector session
class Niapi {
  constructor (options) {
    this.url = options.url
  }

  getSessions (cb) {
    const opts = {
      method: 'GET',
      uri: `${this.url}/json`,
      json: true,
      timeout: 1000
    }
    clientRequest(opts, (err, res, body) => {
      if (err) return cb(err)
      cb(null, body)
    })
  }
}

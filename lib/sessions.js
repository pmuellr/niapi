'use strict'

exports.createSession = createSession

// const lodash = require('lodash')

const WebSocket = require('ws')
const utils = require('./utils')

// const WebSocket = require('ws')

const Logger = utils.getLogger(__filename)

// Returns a new session object.
function createSession (ni, sessionData) {
  return new Session(ni, sessionData)
}

// Manages a debug session
class Session {
  constructor (ni, sessionData) {
    Logger.debug(`new Session(${JSON.stringify(sessionData)})`)
    this._ni = ni

    for (let k in sessionData) {
      this[k] = sessionData[k]
    }
  }

  getSocket () {
    Logger.debug(`creating WebSocket(${this.webSocketDebuggerUrl})`)
    return new WebSocket(this.webSocketDebuggerUrl)
  }
}

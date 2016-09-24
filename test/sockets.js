'use strict'

// const lodash = require('lodash')

const _utils = require('./_utils')

const niapi = require('../niapi')
const utils = require('../lib/utils')

const Logger = utils.getLogger(__filename)

const woops = _utils.error
const fixturePath = _utils.fixturePath
const runInDebug = _utils.runInDebug

const test = _utils.createTestRunner(__filename)

test(getSocket, 'port')

// Get the sessions from a debugged app.
function getSocket (t, port) {
  const script = fixturePath('forever.js')
  const cp = runInDebug(script, port, (err, code, signal) => {
    if (err) return woops(t, err)
    t.end()
  })

  utils.delay(1000, () => {
    const ni = niapi.create({port: port})
    ni.getSessions(gotSessions)
  })

  function gotSessions (err, sessions) {
    if (err) return woops(t, err)

    t.ok(sessions.length > 0, 'should have more than one session available')
    if (sessions.length <= 0) return t.end()

    const session = sessions[0]
    const socket = session.getSocket()

    socket.on('error', (err) => {
      Logger.debug('getSocket(): websocket error', err)
    })

    socket.on('open', () => {
      Logger.debug('getSocket(): websocket open')
      cp.kill()
    })

    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    socket.on('message', (data, flags) => {
      Logger.log(`getSocket(): websocket message: ${flags}: ${data}`)
    })
  }
}

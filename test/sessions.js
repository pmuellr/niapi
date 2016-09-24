'use strict'

const lodash = require('lodash')

const _utils = require('./_utils')

const niapi = require('../niapi')
const utils = require('../lib/utils')

const Logger = utils.getLogger(__filename)

const woops = _utils.error
const fixturePath = _utils.fixturePath
const runInDebug = _utils.runInDebug

const test = _utils.createTestRunner(__filename)

test(getSessions, 'port')

// Get the sessions from a debugged app.
function getSessions (t, port) {
  const script = fixturePath('forever.js')
  const cp = runInDebug(script, port, (err, code, signal) => {
    if (err) return woops(t, err)
    t.end()
  })

  Logger.debug(`launched process: ${cp.pid}`)

  utils.delay(1000, () => {
    const ni = niapi.create({port: port})
    ni.getSessions(gotSessions)
  })

  function gotSessions (err, sessions) {
    cp.kill()

    if (err) return woops(t, err)

    t.ok(lodash.isArray(sessions), 'expecting an array of sessions')
    if (!lodash.isArray(sessions)) return t.end()

    let foundPID = false
    for (let session of sessions) {
      Logger.debug(JSON.stringify(session, null, 4))
      t.ok(session.id, 'expecting session property "id"')
      t.ok(session.webSocketDebuggerUrl, 'expecting session property "webSocketDebuggerUrl"')

      if (session.id === `${cp.pid}`) foundPID = true
    }

    t.ok(foundPID, 'expecting to find launched process pid')
  }
}

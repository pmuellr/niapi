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

test(getVersions, 'port')

// Get the versions from a debugged app.
function getVersions (t, port) {
  const script = fixturePath('forever.js')
  const cp = runInDebug(script, port, (err, code, signal) => {
    if (err) return woops(t, err)
    t.end()
  })

  Logger.debug(`launched process: ${cp.pid}`)

  utils.delay(1000, () => {
    const ni = niapi.create({port: port})
    ni.getVersions(gotVersions)
  })

  function gotVersions (err, versions) {
    cp.kill()

    if (err) return woops(t, err)

    t.ok(lodash.isArray(versions), 'expecting an array of versions')
    if (!lodash.isArray(versions)) return t.end()

    for (let version of versions) {
      Logger.debug(JSON.stringify(version, null, 4))
      t.ok(version['Protocol-Version'], 'expecting version property "Protocol-Version"')
    }
  }
}

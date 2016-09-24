'use strict'

const path = require('path')
const childProcess = require('child_process')

const tape = require('tape')
const portfinder = require('portfinder')
const async = require('async')
const lodash = require('lodash')

const utils = require('../lib/utils')

const Logger = utils.getLogger(__filename)

const ProjectPath = path.dirname(__dirname)

exports.createTestRunner = createTestRunner
exports.runInDebug = runInDebug
exports.fixturePath = fixturePath
exports.error = error

// Create a test runner given the source file name of the test.
// Returns a function which takes a test function, which takes a standard `t`
// tape object as a parameter.
function createTestRunner (sourceFile) {
  Logger.debug(`createTestRunner(${sourceFile})`)
  sourceFile = path.relative(ProjectPath, sourceFile)

  return function testRunner (testFunction, injections) {
    const testName = `${sourceFile} - ${testFunction.name}()`
    injections = lodash.toArray(arguments).slice(1)

    tape(testName, function (t) {
      getInjections(injections, (err, injected) => {
        Logger.debug(`testRunner(${testName}, ${JSON.stringify(injections)})`)
        Logger.debug(`testRunner(): injected: ${JSON.stringify(injected)}`)
        if (err) return error(t, err)

        const args = lodash.flatten([t, injected])
        testFunction.apply(null, args)
      })
    })
  }
}

// Get values for injection into tests.
function getInjections (injections, cb) {
  async.map(injections, getValue, cb)

  function getValue (injection, acb) {
    if (injection === 'port') {
      return portfinder.getPort((err, port) => {
        if (port != null) portfinder.basePort = port + 1
        acb(err, port)
      })
    }

    acb(new Error(`unknown injection: "${injection}"`))
  }
}

// Run a Node.js script in inspect mode, at debug port, like cp.spawn()
function runInDebug (script, debugPort, cb) {
  const args = [ `--inspect=${debugPort}`, script ]

  const result = childProcess.spawn('node', args)
  result.unref()

  const debugLabel = `pid: ${result.pid}: `
  Logger.debug(debugLabel, `runInDebug(node ${args.join(' ')})`)

  result.once('exit', (code, signal) => {
    Logger.debug(`${debugLabel} exit:`, code, signal)
    const tmpCB = cb
    cb = null

    if (tmpCB) return tmpCB(null, code, signal)
  })

  result.once('error', (err) => {
    Logger.debug(`${debugLabel} error:`, err)
    const tmpCB = cb
    cb = null

    if (tmpCB) return tmpCB(err)
  })

  return result
}

// Get the full path of a fixture
function fixturePath (relPath) {
  return path.join(__dirname, relPath)
}

const AlreadyEnded = new WeakMap()

// Used to cause a test to fail and end because of unexpected error.
function error (t, err) {
  const alreadyEnded = AlreadyEnded.get(t) || false
  AlreadyEnded.set(t, true)

  t.fail(`unexpected error: ${err}`)
  console.error(err)

  if (!alreadyEnded) t.end()
}

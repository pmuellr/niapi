'use strict'

const path = require('path')
const childProcess = require('child_process')

const tape = require('tape')
const portfinder = require('portfinder')

const async = require('async')
const lodash = require('lodash')

const ProjectPath = path.dirname(__dirname)

exports.createTestRunner = createTestRunner
exports.runInDebug = runInDebug
exports.fixturePath = fixturePath
exports.error = error

// Create a test runner given the source file name of the test.
// Returns a function which takes a test function, which takes a standard `t`
// tape object as a parameter.
function createTestRunner (sourceFile, injections) {
  sourceFile = path.relative(ProjectPath, sourceFile)
  injections = lodash.toArray(arguments).slice(1)

  return function testRunner (testFunction) {
    const testName = `${sourceFile} - ${testFunction.name}()`
    tape(testName, function (t) {
      getInjections(injections, (err, injected) => {
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
      return portfinder.getPort(acb)
    }

    acb(new Error(`unknown injection: "${injection}"`))
  }
}

// Run a Node.js script in inspect mode, at debug port, like cp.spawn()
function runInDebug (script, debugPort) {
  const args = [ `--inspect=${debugPort}`, script ]
  const result = childProcess.spawn('node', args)
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

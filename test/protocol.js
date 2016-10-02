'use strict'

const _utils = require('./_utils')

const test = _utils.createTestRunner(__filename)

const protocol = require('../lib/protocol')

test(buildProtocol)

// Check the package name.
function buildProtocol (t) {
  const lib = protocol.build('1.2')

  t.ok(lib)
  t.end()
}

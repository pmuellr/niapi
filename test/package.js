'use strict'

const _utils = require('./_utils')

const test = _utils.createTestRunner(__filename)

const pkg = require('../package.json')

test(packageName)

// Check the package name.
function packageName (t) {
  t.deepEqual(pkg.name, 'niapi', 'checking package name')
  t.end()
}

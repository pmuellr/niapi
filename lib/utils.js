'use strict'

const logger = require('./logger')

exports.getLogger = logger.getLogger
exports.delay = delay

// setTimeout() with reversed parameters
function delay (ms, fn) {
  setTimeout(fn, ms)
}

'use strict'

exports.getLogger = getLogger

const path = require('path')

const lodash = require('lodash')

const IsDebug = process.env.DEBUG != null
const BasePath = path.dirname(__dirname)

// Create a new logger.
function getLogger (fileName) {
  return new Logger(fileName)
}

// Create a new logger, to log nice messages to stdXXX.
class Logger {
  constructor (fileName) {
    this._fileName = path.relative(BasePath, fileName)
  }

  // Convert arguments to strings, join with ' ', write as a log message.
  log (messageParms) {
    this._print('[LOG]  ', lodash.toArray(arguments).slice(0))
  }

  // Like log, but only if debug enabled, and with an extra debug label.
  debug (messageParms) {
    if (!IsDebug) return
    this._print('[DEBUG]', lodash.toArray(arguments).slice())
  }

  // internal impl that prints the message
  _print (prefix, messageParms) {
    const date = new Date()
    const time = new Date(date.getTime() - date.getTimezoneOffset() * 1000 * 60)
      .toISOString()
      .substr(11, 12)

    const parts = [ time ]

    if (prefix != null && prefix !== '') parts.push(prefix)

    parts.push(this._fileName)

    messageParms = messageParms.map((parm) => `${parm}`)
    for (let parm of messageParms) {
      parts.push(parm)
    }

    console.log(parts.join(' '))
  }
}

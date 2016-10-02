'use strict'

exports.build = build

const EventEmitter = require('events')

const utils = require('./utils')

const Logger = utils.getLogger(__filename)

// Return a new protocol library.
function build (ws, version) {
  switch (version) {
    case '1.1': break
    case '1.2': break
    default:
      Logger.debug(`invalid protocol version specified: ${version}`)
      return null
  }

  const specModule = `../protocol/${version}.json`
  const spec = require(specModule)

  const result = new EventEmitter()

  ws.on('error', (err) => result.emit('error', err))
  ws.on('open', () => result.emit('open'))
  ws.on('close', (code, message) => result.emit('close', code, message))
  ws.on('message', (data, flags) => result._onMessage(data, flags))

  result.version = spec.version
  result.domain = {}
  result._nextID = 1
  result._cbs = {}
  result._onMessage = function (data, flags) {
    if (data.id) {
      const cb = result._cbs[data.id]
      delete result._cbs[data.id]

      if (cb == null) return
      if (data.error) return cb(data.error)
      return cb(null, data.result || {})
    }

    Logger.log(`received message: ${data}`)
  }

  for (let domainSpec of spec.domains) {
    const domain = new EventEmitter()
    domain.cmd = {}

    for (let commandSpec of domainSpec.commands) {
      domain.cmd[commandSpec.name] = function (parms, cb) {
        const msg = {
          id: result._nextID++,
          method: commandSpec.name,
          params: parms
        }

        result._cbs[msg.id] = cb

        ws.send(JSON.stringify(msg), (err) => {
          if (err) return result.emit('error', err)
        })
      }
    }
  }

  return result
}

if (require.main === module) main()

function main () {
  const spec = build('1.2')

  for (let domainName in spec.domain) {
    const domain = spec.domain[domainName]
    console.log(domain.name)

    if (domain.functions.length !== 0) {
      console.log('  functions:')
      for (let fn of domain.functions) {
        console.log(`    ${fn}()`)
      }
    }

    if (domain.events.length !== 0) {
      console.log('  events:')
      for (let event of domain.events) {
        console.log(`    ${event}`)
      }
    }
  }
}

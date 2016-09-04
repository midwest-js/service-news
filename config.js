'use strict'

const p = require('path')
const fs = require('fs')

const config = {}

const fileName = p.join(process.cwd(), 'server/config/languages.js')

if (fs.existsSync(fileName)) {
  config.languages = require(fileName)
}

module.exports = config

var path = require('path')
var home = require('osenv').home

module.exports = require('rc')('brickhouse', {
  path: path.join(home, '.brickhouse')
})

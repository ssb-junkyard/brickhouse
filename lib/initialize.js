var path   = require('path')
var fs     = require('fs')
var toPull = require('stream-to-pull-stream')
var pull   = require('pull-stream')
var cont   = require('cont')

module.exports = function (blobs, db, override, cb) {
  if('function' === typeof override)
    cb = override, override = false

  var appsDB = db.sublevel('apps')
  var build = path.join(__dirname, '..', 'defaults')
  fs.readdir(build, function (err, ls) {
    cont.para(ls.map(function (app) {
      return function (cb) {
        pull(
          toPull.source(fs.createReadStream(path.join(build, app, 'app.js'))),
          blobs.add(function (err, hash) {
            if(err) return cb(err)
            appsDB.get(app, function (err, value) {
              if(true) appsDB.put(app, {hash: hash}, cb)
              else    cb()
            })
          })
        )
      }
    })) (cb)
  })
}

if(!module.parent) {
  var config = require('../config')
  var MultiBlob = require('multiblob')
  var Level = require('level')
  var Sublevel = require('level-sublevel')

  var blobs = MultiBlob({
    dir: path.join(config.path, 'blobs'), alg: 'sha256'
  })
  var db = Sublevel(
    Level(path.join(config.path, 'db'), {valueEncoding: 'json'})
  )
  module.exports(blobs, db, true, function (err) {
    if(err) throw err
  })
}

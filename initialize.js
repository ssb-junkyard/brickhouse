var path   = require('path')
var fs     = require('fs')
var toPull = require('stream-to-pull-stream')
var pull   = require('pull-stream')

module.exports = function (blobs, db) {

  var appsDB = db.sublevel('apps')
  var build = path.join(__dirname, 'build')
  fs.readdir(build, function (err, ls) {

    cont.para(ls.map(function (file) {
      return function (cb) {
        var name = file.replace(/\.js$/, '')
        pull(
          toPull.source(fs.createReadStream(path.join(build, file))),
          blob.add(function (err, hash) {
            if(err) return cb(err)
            appsDB.get(name, function (err) {
              if(err)
                appsDB.put(name, {hash: hash}, cb)
              else
                cb()
            })
          })
        )
      }
    })
  })
}

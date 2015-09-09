var pull   = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var URL    = require('url')
var fs     = require('fs')

module.exports = function (opts) {
  var nowaitOpts = { nowait: true }, id = function(){}
  var sbot = require('./sbot').get()

  return function (req, res) {
    // local-host only
    if (req.socket.remoteAddress != '127.0.0.1' &&
        req.socket.remoteAddress != '::ffff:127.0.0.1' &&
        req.socket.remoteAddress != '::1') {
      sbot.emit('log:info', ['patchwork', null, 'Remote access attempted by', req.socket.remoteAddress])
      respond(403)
      return res.end('Remote access forbidden')
    }

    // restrict the CSP
    // - localhost:7777 is the blob-server
    res.setHeader('Content-Security-Policy', 
      "default-src http://localhost:7777 'unsafe-inline' 'unsafe-eval' data: ssb:; "+
      "object-src 'none'; "+
      "frame-src 'none'; "+
      "sandbox allow-same-origin allow-scripts"
    )

    // blobs
    var parsed = URL.parse(req.url, true)
    if (parsed.query.bundle) {
      // serve app bundle
      res.writeHead(200)
      if (req.url.charAt(1) == '&') {
        res.end('<html><body><script src="http://localhost:'+opts.port+parsed.pathname+'"></script></body></html>')
      } else {
        // for files, write as embedded html, because the CSP doesn't allow loading via <script src>
        res.write('<html><body><script>')
        fs.readFile(parsed.pathname, { encoding: 'utf-8' }, function (err, file) {
          if (err)
            alert(err)
          else
            res.write(file)
          res.end('</script></body></html>')
        })
      }
    }
    else if (req.url.charAt(1) == '&') {
      serveblob(parsed.pathname.slice(1), parsed.query.fallback)
    } else if (opts.servefiles) {
      // serve file    
      return fs.createReadStream(parsed.pathname)
        .on('error', function () {
          res.writeHead(404)
          res.end('File not found')
        })
        .pipe(res)
    } else {
      respond(404)
      res.end('File not found')
    }
    function respond (code) {
      res.writeHead(code)
      sbot.emit('log:info', ['patchwork', null, code + ' ' + req.method + ' ' + req.url])
    }
    function serveblob (hash, fallback, isAutoIndex) {
      sbot.blobs.has(hash, function(err, has) {
        if (!has) {
          sbot.blobs.want(hash, nowaitOpts, id)
          respond(404)
          res.end('File not found')
          return
        }
        respond(200)
        pull(
          sbot.blobs.get(hash),
          toPull(res)
        )
      })
    }
  }
}
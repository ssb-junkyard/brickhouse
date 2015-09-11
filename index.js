var app  = require('app')
var Menu = require('menu')
var path = require('path')
var http = require('http')

var config = require('./config')
var MultiBlob = require('multiblob')
var Level = require('level')
var Sublevel = require('level-sublevel')

var menu = require('./lib/menu')
var windows = require('./lib/windows')
var bookmarks = require('./lib/bookmarks')

var blobs = MultiBlobs({
  dir: path.join(config.path, 'blobs'), alg: 'sha256'
})

var db = Sublevel(Level(path.join(config.path, 'db')))

var appDB = db.sublevel('apps')

var n = 3

http.createServer(httpStack.BlobStack(blobs)).listen(7777, next)
http.createServer(httpStack.FileStack(blobs)).listen(7778, next)

app.on('ready', next)

var httpStack = require('./lib/http-server')

function next () {
  if(!--n) return

  // setup servers
//  var sbot = require('./lib/sbot').setup()
//  bookmarks.load(path.join(require('./lib/sbot').getConfig().path, 'bookmarks.json'))


  // setup ssb protocol
  var protocol = require('protocol')
  protocol.registerProtocol('blob', function (req, cb) {
    var path = req.url.slice(4) // skip the 'ssb:'
    return new protocol.RequestHttpJob({ url: 'http://localhost:7777/'+path })
  })

  appDB.get('home', function (err, data) {
    if(err) {
      //we have to bail out here, because we can't do anything
      //if the main can't load.
      console.error(err.stack)
      return app.quit()
    }

    //how to initialize 
    windows.open('blob:'+
      path.join(__dirname, 'defaults', 'build', 'home.js')
    )
  })

  // open launcher window
//  windows.openLauncher()
  // mainWindow.openDevTools()

  // dynamically update main menu on osx
  if (process.platform == 'darwin') {
    app.on('browser-window-focus', function (e, window) {
      if (window.menu)
        Menu.setApplicationMenu(window.menu)
    })
  }
}

var app  = require('app')
var Menu = require('menu')
var path = require('path')
var http = require('http')

var config = require('./config')
var MultiBlob = require('multiblob')
var Level = require('level')
var Sublevel = require('level-sublevel')
var httpStack = require('./lib/http-server')

var menu = require('./lib/menu')
var windows = require('./lib/windows')
var bookmarks = require('./lib/bookmarks')

var blobs = MultiBlob({
  dir: path.join(config.path, 'blobs'), hash: 'sha256'
})

var db = Sublevel(Level(path.join(config.path, 'db'), {valueEncoding: 'json'}))

var appDB = db.sublevel('apps')

var n = 4

http.createServer(httpStack.BlobStack(blobs)).listen(7777, next)
http.createServer(httpStack.FileStack(blobs)).listen(7778, next)
app.on('ready', next)

//copy default apps into the database. (simpler from running outside apps)
//especially since we are bundling the apps.
//---there is probably a better way to do this---
require('./lib/initialize')(blobs, db, next)

function next (err) {
  if(err && err.stack) {
    console.error('error getting app ready')
    console.error(err.stack)
    return app.quit()
  }
  if(--n) return

  // setup servers
//  var sbot = require('./lib/sbot').setup()
//  bookmarks.load(path.join(require('./lib/sbot').getConfig().path, 'bookmarks.json'))


  // setup ssb protocol
  var protocol = require('protocol')
  protocol.registerProtocol('brick', function (req, cb) {
    var path = req.url.slice(6) // skip the 'ssb:'
    var url = 'http://localhost:7777/'+path
    return new protocol.RequestHttpJob({ url: url })
  })

  appDB.get('home', function (err, data) {
    if(err) {
      //we have to bail out here, because we can't do anything
      //if the main can't load.
      console.error('error loading home app')
      console.error(err.stack)
      return app.quit()
    }

    //how to initialize
    console.log(data)
    windows.open('brick:'+data.hash + '?bundle=1')
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

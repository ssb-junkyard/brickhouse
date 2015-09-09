var BrowserWindow = require('browser-window')
var Menu          = require('menu')
var dialog        = require('dialog')
var path          = require('path')
var shell         = require('shell')
var ipc           = require('ipc')
var muxrpc        = require('muxrpc')
var pull          = require('pull-stream')
var pullipc       = require('pull-ipc')
var URL           = require('url')
var bookmarks     = require('./bookmarks')

var windows = []
var clientApi = {}
var requiredOpts = {
  preload: path.join(__dirname, './preload.js'),
  javascript: true,
  'web-security': true,
  'node-integration': false,
  images: true,
  java: false,
  webgl: false, // maybe allow?
  webaudio: false, // maybe allow?
  plugins: false,
  'experimental-features': false,
  'experimental-canvas-features': false,
  'shared-worker': false
}

var open =
module.exports.open = function (url, opts, manifest, rpcapi) {
  var sbot = require('./sbot').get()
  opts = opts || { width: 1030, height: 720 }

  // copy over fixed options
  for (var k in requiredOpts)
    opts[k] = requiredOpts[k]

  // setup the window
  var win = new BrowserWindow(opts)
  win.loadUrl(url)
  win.contentInfo = {
    url: url,
    param: url ? URL.parse(url).pathname : null,
    isblob: (url.indexOf('http://localhost:7777') === 0 || url.indexOf('ssb:') === 0),
    isfile: (url.indexOf('http://localhost:7778') === 0),
  }
  if (win.contentInfo.isblob)
    win.contentInfo.param = win.contentInfo.param.slice(1)
  if (manifest && rpcapi)
    setupRpc(win, manifest, rpcapi)

  // if we're trying to open a blob, check if we have the blob
  if (win.contentInfo.isblob) {
    var hash = win.contentInfo.param
    sbot.blobs.has(hash, function (err, has) {
      if (has) return
      // doesnt exist, open the searcher
      openSearcher(hash)
      win.close()
    })
  }

  // create the menu
  win.menu = require('./menu').create(win)
  win.setMenu(win.menu)
  if (process.platform == 'darwin')
    Menu.setApplicationMenu(win.menu)

  // manage the window's lifecycle
  windows.push(win)
  win.on('closed', function() {
    var i = windows.indexOf(win)
    windows.splice(i, 1)
    win = null
  })
  
  // event handlers
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    if (url.indexOf('ssb') === 0) {
      // open in brickhouse
      var sbot = require('./sbot').get()
      open(url, null, sbot.manifest(), sbot)
    } else {
      // open in the browser
      shell.openExternal(url)
    }
  })
  win.webContents.on('will-navigate', function (e, url) {
    e.preventDefault()
    console.log('Prevented navigation to', url)
  })

  return win
}

var openLauncher =
module.exports.openLauncher = function () {
  return open('file://' + path.join(__dirname, '../ui/launcher.html'), 
    { width: 420, height: 500 },
    { open: 'async', getBookmarks: 'sync', removeBookmark: 'sync' },
    {
      open: function (url, cb) {
        var sbot = require('./sbot').get()
        open(url, null, sbot.manifest(), sbot)
        cb()
      },
      getBookmarks: bookmarks.get,
      removeBookmark: bookmarks.remove
    }
  )
}

var openSearcher =
module.exports.openSearcher = function (blobhash) {
  var sbot = require('./sbot').get()
  return open('file://' + path.join(__dirname, '../ui/searcher.html#'+blobhash), 
    { width: 960, height: 120 },
    { blobs: sbot.manifest().blobs, open: 'async' },
    {
      blobs: sbot.blobs,
      open: function (url, cb) {
        open(url, null, sbot.manifest(), sbot)
        cb()
      }
    }
  )
}

function setupRpc (window, manifest, rpcapi) {
  // add rpc APIs to window
  window.createRpc = function () {
    // create rpc object
    var rpc = window.rpc = muxrpc(clientApi, manifest, serialize)(rpcapi)
    function serialize (stream) { return stream }

    // start the stream
    window.rpcstream = rpc.createStream()
    var ipcstream = pullipc('muxrpc', ipc, window, function (err) {
      console.log('ipc-stream ended', err)
    })
    pull(ipcstream, window.rpcstream, ipcstream)
  }
  window.resetRpc = function () {
    console.log('close rpc')
    window.rpcstream.source('close')
    window.rpc.close()
    window.createRpc()
  }

  // setup default stream
  window.createRpc()

  // setup helper messages
  ipc.on('fetch-manifest', function(e) {
    if (e.sender == window.webContents)
      e.returnValue = manifest
  })
}
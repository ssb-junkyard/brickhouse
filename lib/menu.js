var Menu      = require('menu')
var dialog    = require('dialog')
var toPull    = require('stream-to-pull-stream')
var pull      = require('pull-stream')
var fs        = require('fs')
var windows   = require('./windows')
var bookmarks = require('./bookmarks')

var create =
module.exports.create = function (win) {
  var sbot = require('./sbot').get()

  var appmenu = []
  if (win.contentInfo.isfile) {
    appmenu = [{
      label: 'Freeze Snapshot',
      accelerator: 'CmdOrCtrl+P',
      click: function (e, window) {
        // add file to blobstore
        pull(
          toPull.source(fs.createReadStream(win.contentInfo.param)),
          sbot.blobs.add(function (err, hash) {
            if (err) {
              console.error(err)
              dialog.showErrorBox('Failed to Freeze Snapshot', err.message || err)
            } else {
              dialog.showMessageBox(window, {
                type: 'info',
                title: 'Snapshot\'s Hash',
                message: 'Snapshot\'s Hash',
                detail: hash,
                buttons: ['OK']
              })
            }
          })
        )
      }
    }]
  }
  if (win.contentInfo.isfile || win.contentInfo.isblob) {
    var isBookmarked = (bookmarks.find(win) >= 0)
    var bookmarkTmpl = {
      label: (isBookmarked) ? 'Unbookmark This App' : 'Bookmark This App',
      accelerator: 'CmdOrCtrl+B',
      click: function (e, window) {
        // update bookmark
        if (isBookmarked) bookmarks.remove(win)
        else              bookmarks.add(win)

        // recreate menu
        win.menu = create(win)
        win.setMenu(win.menu)
        if (process.platform == 'darwin')
          Menu.setApplicationMenu(win.menu)
      }
    }
    appmenu = (appmenu||[]).concat([bookmarkTmpl, { type: 'separator' }])
  }

  var template = [
    {
      label: 'Patchwork',
      submenu: [
        {
          label: 'About Patchwork',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide Patchwork',
          accelerator: 'CmdOrCtrl+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          selector: 'terminate:'
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    },
    {
      label: 'Application',
      submenu: (appmenu||[]).concat([
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function (e, window) { window.reload(); }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: function (e, window) { window.toggleDevTools(); }
        }
      ])
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: function (e, window) { windows.openLauncher() }
        },
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }
      ]
    },
    {
      label: 'Help',
      submenu: []
    }
  ]

  return Menu.buildFromTemplate(template)
}
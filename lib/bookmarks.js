var fs = require('fs')
var filepath, bookmarks

module.exports.load = function (p) {
  filepath = p
  try {
    bookmarks = JSON.parse(fs.readFileSync(p, { encoding: 'utf-8' }))
  } catch (e) {
    console.log('Failed to load bookmarks file', p, e.toString())
    bookmarks = []
  }
}

function save () {
  if (!filepath) return
  fs.writeFileSync(filepath, JSON.stringify(bookmarks, null, 2), { encoding: 'utf-8' })
}

function fromwin (win) {
  if (win.contentInfo)
    return { 
      url: win.contentInfo.url,
      param: win.contentInfo.param,
      isblob: win.contentInfo.isblob,
      isfile: win.contentInfo.isfile,
      title: win.getTitle() || win.contentInfo.param
    }
  return win
}

var find =
module.exports.find = function (info) {
  info = fromwin(info)
  for (var i=0; i < bookmarks.length; i++) {
    if (bookmarks[i].url == info.url)
      return i
  }
  return -1
}

module.exports.get = function () {
  return bookmarks
}

module.exports.add = function (info) {
  info = fromwin(info)
  var i = find(info)
  if (i === -1)
    bookmarks.push(info)
  else
    bookmarks.splice(i, 1, info)
  save()
}

module.exports.remove = function (info) {
  info = fromwin(info)
  var i = find(info)
  if (i !== -1)
    bookmarks.splice(i, 1)
  save()
}
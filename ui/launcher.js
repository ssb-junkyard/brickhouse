getBookmarks()

function openhash (e) {
  var hash = byhash.hash.value
  if (hash) doopen('http://localhost:7777/'+hash+'?bundle=1')
  return false
}
function openpath (e) {
  doopen('http://localhost:7778'+byfile.path.files[0].path+'?bundle=1')
  return false
}
function doopen (url) {
  ssb.open(url, function (err) {
    if (err) {
      console.error(err)
      alert(err.message)
    } else
      window.close()
  })
}

var _list = []
function getBookmarks () {
  ssb.getBookmarks(function (err, list) {
    _list = list
    if (list.length) {
      bookmarks.innerHTML = list.map(function (item, i) {
        return ['<p>',
          '<a href="#" onclick="openBookmark('+i+')">'+item.title+'</a> ',
          '<a class="remove" href="#" onclick="removeBookmark('+i+')" title="Remove Bookmark">&times;</a><br>',
          '<small>'+item.param+'</small>',
        '</p>'].join('')
      }).join('')
    } else
      bookmarks.innerHTML = '<p><small>Nothing bookmarked yet</small></p>'
  })
}
function openBookmark (i) {
  doopen(_list[i].url)
}
function removeBookmark (i) {
  ssb.removeBookmark(_list[i], function (err) {
    if (err) {
      console.error(err)
      alert(err.message)
    } else
      getBookmarks()
  })
}
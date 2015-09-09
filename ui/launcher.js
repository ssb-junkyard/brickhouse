function openhash (e) {
  var hash = byhash.hash.value
  if (hash) open('http://localhost:7777/'+hash+'?bundle=1')
  return false
}
function openpath (e) {
  open('http://localhost:7778'+byfile.path.files[0].path+'?bundle=1')
  return false
}
function open (url) {
  ssb.open(url, function (err) {
    if (err) {
      console.error(err)
      alert(err.message)
    } else
      window.close()
  })
}
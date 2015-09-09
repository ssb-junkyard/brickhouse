'use strict'

var hash = window.location.hash
if (hash.charAt(0) == '#')
  hash = hash.slice(1)

title.innerText = 'Searching the network for '+hash

// periodically poll for the file
var poll = setInterval(pollBlob, 10e3)

function pollBlob () {
  console.log('checking...')
  ssb.blobs.has(hash, function (err, has) {
    if (has) {
      console.log('blob found')
      clearInterval(poll)
      document.title = 'brickhouse: found'
      title.innerText = 'found, redirecting'
      ssb.open('http://localhost:7777/'+hash)
      window.close()
    } else
      console.log('not yet found')
  })
}
#! /usr/bin/env node
(function prelude(content, deps, entry) {
  var cache = {}

  function load (file) {
    var d = deps[file]
    if(cache[file]) return cache[d]
    if(!d) return require(file)
    var fn = content[d[0]] //the actual module
    var module = {exports: {}, parent: file !== entry}
    return cache[file] = fn(
      function (m) {
        if(!deps[file][m]) return require(m)
        else               return load (deps[file][m])
      },
      module,
      module.exports,
      file.substring(file.lastIndexOf('/')),
      file
    )
  }

  return load(entry)
})({
"yRh3lsZKjW7bVSSKqEkPAhEbftwMqLEP+xMhX6/LvDI=":
function (require, module, exports, __dirname, __filename) {

var h = require('hyperscript')

document.body.appendChild(h('h1', 'it works'))



},

}
,
{
  "index.js": [
    "yRh3lsZKjW7bVSSKqEkPAhEbftwMqLEP+xMhX6/LvDI=",
    {}
  ]
},
"index.js")

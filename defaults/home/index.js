
var h = require('hyperscript')

document.body.appendChild(h('h1', 'home app'))
document.body.appendChild(h('p',
    'this is just the simplest possible thing',
    'to test that the supporting stuff all works.',
    'this is the app which would be responsible for the first app.',
    'and would do stuff like manage the other apps, or window management stuff'
  )
)


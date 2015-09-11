var Tab = React.createClass({
  render: function () {
    var title = this.props.win.title || 'loading'
    return <div className={this.props.isActive ? 'active' : ''} title={title} onClick={this.props.onClick} onContextMenu={this.props.onContextMenu}>
      <span>{title}</span>
      <a onClick={this.props.onClose}>&times;</a>
    </div>
  }
})

var Tabs = React.createClass({
  getInitialState: function () {
    return { windows: [], current: 0 }
  },

  componentDidMount: function () {
    var self = this
    pull(ssb.updates(), pull.drain(function (windows) {
      self.setState({ windows: windows })
    }))
  },

  onTabClick: function (e, win, i) {
    this.setState({ current: i })
    ssb.focuswin(i)
  },
  onTabClose: function (e, win, i) {
    ssb.closewin(i)
  },
  onNewTab: function () {
    ssb.newwin()
  },

  render: function () {
    var self = this
    return <div id="tabs">
      {this.state.windows.map(function (win, i) {
        if (i === 0) // skip the first, because it's this navbar
          return
        
        function onClick (e) { self.onTabClick(e, win, i) }
        function onContextMenu (e) { self.onTabContextMenu(e, win, i) }
        function onClose (e) { e.preventDefault(); e.stopPropagation(); self.onTabClose(e, win, i) }
        return <Tab key={'tab-'+i} isActive={self.state.current == i} win={win} onClick={onClick} onContextMenu={onContextMenu} onClose={onClose} />
      })}
      <a className="newtab" onClick={this.onNewTab}>+</a>
    </div>
  }  
})

React.render(
  <Tabs />,
  document.getElementById('content')
)


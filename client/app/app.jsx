var React = require('react');

require('./app.less');
require('../vendor/bootstrap/css/bootstrap.min.css');
require('../vendor/font-awesome/css/font-awesome.min.css');

var Router = require('react-router'),
  RouteHandler = Router.RouteHandler,
  Route = Router.Route;

var mui = require('material-ui'),
  Toolbar = mui.Toolbar,
  ToolbarGroup = mui.ToolbarGroup,
  Icon = mui.Icon,
  DropDownMenu = mui.DropDownMenu,
  FloatingActionButton = mui.FloatingActionButton;

var actions = require('./actions');

module.exports = React.createClass({

  mixins: [Router.Navigation, Router.State],

  render: function () {

    var stats = [
      { payload: '1', text: '', route: 'home' },
      { payload: '2', text: 'Temperature', route: 'temperatureStats' },
      { payload: '3', text: 'Humidity', route: 'humidityStats' },
      { payload: '4', text: 'Pressure', route: 'pressureStats' }
    ];

    return (
      <div>
        <header>
          <Toolbar>
            <ToolbarGroup key={0} float="left">
              <Icon icon="action-info" onClick={this.onNavToDevice} />
              <span className="mui-toolbar-separator">&nbsp;</span>
              <DropDownMenu menuItems={stats} onChange={this.onStatsChanged} />
              <Icon tooltip="kill" style={{ 'color': 'red', 'margin-left': -45, 'font-size': 'smaller' }} icon="alert-warning" onClick={this.onKill} />
            </ToolbarGroup>
          </Toolbar>
        </header>
        <div className="activeNavItem">
          <RouteHandler />
        </div>
      </div>
    );
  },

  onStatsChanged: function (e, selectedIndex, menuItem) {
    console.log(arguments);
    this.transitionTo(menuItem.route);
  },

  onKill: function () {
    actions.cmd.kill(function (evt) { console.log(evt); });
  },

  onNavToDevice: function () {
    this.transitionTo('home');
  }
});

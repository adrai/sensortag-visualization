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
  RaisedButton = mui.RaisedButton,
  FlatButton = mui.FlatButton;

var actions = require('./actions');

module.exports = React.createClass({

  mixins: [Router.Navigation, Router.State],

  render: function () {

    return (
      <div>
        <header>
          <Toolbar>
            <ToolbarGroup key={0} float="left">
              <FlatButton label="Device" onClick={this.onNavToDevice} />
            </ToolbarGroup>
            <ToolbarGroup key={1} float="left">
              <span className="mui-toolbar-separator">&nbsp;</span>
              <FlatButton label="Temperature" onClick={this.onNavToTemperature} />
              <FlatButton label="Humidity" onClick={this.onNavToHumidity} />
              <FlatButton label="Pressure" onClick={this.onNavToPressure} />
            </ToolbarGroup>
            <ToolbarGroup key={2} float="right">
              <span className="mui-toolbar-separator">&nbsp;</span>
              <RaisedButton label="kill" primary={true} onClick={this.onKill} />
            </ToolbarGroup>
          </Toolbar>
        </header>
        <div className="activeNavItem">
          <RouteHandler />
        </div>
      </div>
    );
  },

  onKill: function () {
    actions.cmd.kill(function (evt) { console.log(evt); });
  },

  onNavToDevice: function () {
    this.transitionTo('home');
  },

  onNavToTemperature: function () {
    this.transitionTo('temperatureStats');
  },

  onNavToHumidity: function () {
    this.transitionTo('humidityStats');
  },

  onNavToPressure: function () {
    this.transitionTo('pressureStats');
  }
});

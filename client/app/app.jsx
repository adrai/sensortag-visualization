var React = require('react');

require('./app.styl');
require('../vendor/bootstrap/css/bootstrap.min.css');
require('../vendor/font-awesome/css/font-awesome.min.css');

var Router = require('react-router'),
  RouteHandler = Router.RouteHandler,
  Route = Router.Route;

var ReactBootstrap = require('react-bootstrap'),
  Nav = ReactBootstrap.Nav,
  Navbar = ReactBootstrap.Navbar,
  Button = ReactBootstrap.Button;

var ReactRouterBootstrap = require('react-router-bootstrap'),
  NavItemLink = ReactRouterBootstrap.NavItemLink,
  ButtonLink = ReactRouterBootstrap.ButtonLink;

var actions = require('./actions');

module.exports = React.createClass({

  onKill: function () {
    actions.cmd.kill(function (evt) { console.log(evt); });
  },

  render: function() {
    return (
      <div>
        <header>
          <Navbar>
            <Nav>
              <NavItemLink
                to="home"
                someparam="hello">
                Home
              </NavItemLink>
              <NavItemLink
                to="stats"
                someparam="hello2">
                Stats
              </NavItemLink>
              <Button className="pull-right" onClick={this.onKill}>kill</Button>
            </Nav>
          </Navbar>
        </header>
        <div className="activeNavItem">
          <RouteHandler />
        </div>
      </div>
    );
  }
});

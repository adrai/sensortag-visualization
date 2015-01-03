var React = require('react');

require('./app.styl');
require('../vendor/bootstrap/css/bootstrap.min.css');
require('../vendor/font-awesome/css/font-awesome.min.css');

var Router = require('react-router'),
    RouteHandler = Router.RouteHandler,
    Route = Router.Route;

var ReactBootstrap = require('react-bootstrap'),
    Nav = ReactBootstrap.Nav,
    Navbar = ReactBootstrap.Navbar;

var ReactRouterBootstrap = require('react-router-bootstrap'),
    NavItemLink = ReactRouterBootstrap.NavItemLink,
    ButtonLink = ReactRouterBootstrap.ButtonLink;

module.exports = React.createClass({
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
              {/*<NavItemLink
                to="todos"
                someparam="hello2">
                Todos
              </NavItemLink>*/}
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

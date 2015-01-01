var React = require('react');
var Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    NotFoundRoute = Router.NotFoundRoute,
    Routes = Router.Routes;

var App = require('./app');
var Home = require('./home');
var Todos = require('./todos');

var routes = (
  <Route name="layout" path="/" handler={App}>
    <DefaultRoute name="home" handler={Home} />
    <Route name="todos" handler={Todos} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});

// React.render(routes, document.body);

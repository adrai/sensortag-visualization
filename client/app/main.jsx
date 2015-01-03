var React = require('react'),
    Reflux = require('reflux'),
    Router = require('react-router'),
    Route = Router.Route,
    DefaultRoute = Router.DefaultRoute,
    NotFoundRoute = Router.NotFoundRoute,
    Routes = Router.Routes,
    hub = require('../common/hub');

require('../common/preconfig');

hub.init({ host: window.location.protocol + '//' + window.location.host });

var App = require('./app.jsx');
var Home = require('./home/index.jsx');

var routes = (
  <Route name="layout" path="/" handler={App}>
    <DefaultRoute name="home" handler={Home} />
    {/*<Route name="todos" handler={Todos} />*/}
  </Route>
);

hub.on('offline', function () {
  console.log('socket offline');
});

hub.on('online', function () {
  console.log('socket online');
  Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.body);
  });
});

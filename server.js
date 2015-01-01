'use strict';

var options = require('./settings'),
  logging = require('./lib/logger'),
  webserver = require('./lib/webserver'),
  sessionstore = require('./lib/sessionstore'),
  loadRoutes = require('./lib/routesLoader'),
  repository = require('./lib/repository'),
  appHandle = require('./lib/appHandle'),
  path = require('path');

var LOGGER = logging.init(options.logging).getLogger('server');

var web = webserver(options);

repository(options.repository, function (err, repo) {
  if (err) {
    LOGGER.error('Error connecting repository: ', err);
    return;
  }

  var routes = loadRoutes(path.join(__dirname, '/lib/routes'), [repo]);

  sessionstore(options.sessionStore, function (err, ss) {
    if (err) {
      LOGGER.error('Error starting server: ', err);
      return;
    }

    web.useSessionStore(ss);

    web.addRoutes(routes);

    web.lastRouteHandle(appHandle(options));

    web.listen();
  });
});

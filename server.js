'use strict';

var options = require('./settings'),
  logging = require('./lib/logger'),
  webserver = require('./lib/webserver'),
  socketserver = require('./lib/socketserver'),
  sessionstore = require('./lib/sessionstore'),
  loadRoutes = require('./lib/routesLoader'),
  repository = require('./lib/repository'),
  appHandle = require('./lib/appHandle'),
  sensortag = require('./lib/sensortag'),
  path = require('path');

var LOGGER = logging.init(options.logging).getLogger('server');

var web = webserver(options);
var socket = socketserver(options);

var sensor = sensortag();

sensor.on('event', function (evt) {
  if (LOGGER.level === 'debug') {
    LOGGER.debug('(sensortag -> host -> client) | Received EVENT "' + evt.name + '" with id: "' + evt.id + '" ==> \n' + JSON.stringify(evt, null, 4));
  } else {
    LOGGER.info('(sensortag -> host -> client) | Received EVENT "' + evt.name + '" with id: "' + evt.id + '"');
  }
  socket.all.emit('event', evt);
});

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

    socket.useSessionStore(ss);

    web.useSessionStore(ss);

    web.addRoutes(routes);

    web.lastRouteHandle(appHandle(options));

    socket.useHttpHandle(web.getHttpHandle());

    web.listen();
  });
});

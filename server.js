#!/usr/bin/env node

'use strict';

var options = require('./settings'),
  logging = require('./lib/logger'),
  webserver = require('./lib/webserver'),
  socketserver = require('./lib/socketserver'),
  sessionstore = require('./lib/sessionstore'),
  loadRoutes = require('./lib/routesLoader'),
  denormalizer = require('./lib/denormalizer'),
  appHandle = require('./lib/appHandle'),
  sensortag = require('./lib/sensortag'),
  path = require('path');

var LOGGER = logging.init(options.logging).getLogger('server');

var web = webserver(options);
var socket = socketserver(options);

function start () {
  var sensor = sensortag(options.enableSensorSimulation);

  socket.on('command', function (cmd) {
    if (LOGGER.level === 'debug') {
      LOGGER.debug('(host -> sensortag) | Received COMMAND "' + cmd.name + '" with id: "' + cmd.id + '" ==> \n' + JSON.stringify(cmd, null, 4));
    } else {
      LOGGER.info('(host -> sensortag) | Received COMMAND "' + cmd.name + '" with id: "' + cmd.id + '"');
    }

    if (cmd.name === 'kill') {
      LOGGER.warn('Killing myself, since I got a kill command...');
      process.exit(1);
      return;
    }

    sensor.emit('command', cmd);
  });

  denormalizer(options.repository, function (err, denorm) {
    if (err) {
      LOGGER.error('Error initializing denormalizer: ', err);
      return;
    }

    sensor.on('event', function (evt) {
      LOGGER.info('(sensortag -> host) | Received EVENT "' + evt.name + '" with id: "' + evt.id + '"');
      denorm.handle(evt, function (err) {
        if (err) {
          LOGGER.error('Error while denormalizing event ', err);
        }
      });
    });

    denorm.onEvent(function (evt) {
      if (LOGGER.level === 'debug') {
        LOGGER.debug('(host -> client) | Received EVENT "' + evt.name + '" with id: "' + evt.id + '" ==> \n' + JSON.stringify(evt, null, 4));
      } else {
        LOGGER.info('(host -> client) | Received EVENT "' + evt.name + '" with id: "' + evt.id + '"');
      }
      socket.all.emit('event', evt);
    });

    var repo = denorm.repository;

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
}

if (process.env.DEPLOY_TYPE === 'edison') {
  (function killBluetoothd () {
    console.log('Unblocking BLE...');
    require('async').series([
      function (callback) {
        require('child_process').exec("rfkill unblock bluetooth", function (error, stdout, stderr) {
          console.log(arguments);
          callback(error);
        });
      },
      function (callback) {
        require('child_process').exec("killall bluetoothd", function (error, stdout, stderr) {
          console.log(arguments);
          callback(error);
        });
      },
      function (callback) {
        require('child_process').exec("hciconfig hci0 up", function (error, stdout, stderr) {
          console.log(arguments);
          callback(error);
        });
      }
    ], function () {
      console.log('Finished unblocking BLE...');
      start();
    });
  })();
} else {
  start();
}



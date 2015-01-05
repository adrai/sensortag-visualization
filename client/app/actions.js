'use strict';

var Reflux = require('reflux'),
  api = require('./api'),
  Command = require('../common/command');

var actions = {

  server: Reflux.createActions([
    'loadSensor',
    'loadedSensor',
    'failedLoadingSensor'
  ]),

  cmd: Reflux.createActions([
    'connect',
    'disconnect',

    'kill'
  ]),

  evt: Reflux.createActions([
    'discovered',
    'connected',
    'disconnected',
    'rssiUpdated',

    'temperatureChanged',
    'humidityChanged',
    'barometricPressureChanged'
  ])

};

// Commands
actions.cmd.connect.preEmit = function (sensorTagId, callback) {
  (new Command('connect', sensorTagId)).emit(callback);
};
actions.cmd.disconnect.preEmit = function (sensorTagId, callback) {
  (new Command('disconnect', sensorTagId)).emit(callback);
};
actions.cmd.kill.preEmit = function (callback) {
  (new Command('kill')).emit(callback);
};

// Data Loading
actions.server.loadSensor.preEmit = function () {
  api.getSensor(function (err, data) {
    if (err) {
      return actions.server.failedLoadingSensor(err);
    }

    return actions.server.loadedSensor(data);
  });
};

module.exports = actions;

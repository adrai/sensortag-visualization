'use strict';

var Reflux = require('reflux'),
  api = require('./api');

var actions = {

  server: Reflux.createActions([
    'loadSensor',
    'loadedSensor',
    'failedLoadingSensor'
  ]),

  evt: Reflux.createActions([
    'connected',
    'disconnected',
    'rssiUpdated'
  ])

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

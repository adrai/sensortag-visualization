'use strict';
var Reflux = require('reflux'),
  api = require('./api');

var actions = {

  server: Reflux.createActions([
    'loadSensor',
    'loadedSensor',
    'failedLoadingSensor'
  ])

};

// Data Loading
actions.server.loadSensor.preEmit = function () {
  api.getSensor(function (err, data) {
    if (err) {
      return actions.server.failedLoadingSensor(err);
    }
console.log(data);
    return actions.server.loadedSensor(data);
  });
};

module.exports = actions;

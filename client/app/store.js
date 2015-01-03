'use strict';

var Reflux = require('reflux'),
  actions = require('./actions');

// assert we load that
require('./eventHandler');

module.exports = Reflux.createStore({

  init: function() {
    this.sensor = null;

    this.listenToMany(actions.server);
    this.listenToEvents(actions.evt);
  },

  onLoadSensor: function () {
    console.log('loading sensor.');
  },

  onLoadedSensor: function (sensor) {
    this.loaded = true;
    console.log('loaded sensor.');
    this.sensor = sensor;
    this.trigger({action: 'loadedSensor', sensor: this.sensor});
  },

  onFailedLoadingSensor: function (err) {
    console.log('failed loading sensor! ', err);
  },

  // events
  onConnected: function (sensor) {
    this.sensor.state = 'connected';

    console.log('updated sensor info: ', this.sensor);

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  onDisconnected: function (sensor) {
    this.sensor.state = 'disconnected';

    console.log('updated sensor info: ', this.sensor);

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  onRssiUpdated: function (rssi) {
    this.sensor.rssi = rssi;

    console.log('updated sensor info: ', this.sensor);

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  getSensor: function () {
    if (!this.loaded) {
      actions.server.loadSensor();
    }
    return this.sensor;
  }

});


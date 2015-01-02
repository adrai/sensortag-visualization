'use strict';

var Reflux = require('reflux'),
  actions = require('./actions');

module.exports = Reflux.createStore({

  init: function() {
    this.sensor = null;

    this.listenToMany(actions.server);
  },

  onLoadSensor: function () {
    console.log('loading sensor.');
  },

  onLoadedSensor: function (sensor) {
    this.loaded = true;
    console.log('loaded sensor.');
    this.sensor = sensor;
    this.trigger({action: 'loadedSensor', sensor: sensor});
  },

  onFailedLoadingSensor: function (err) {
    console.log('failed loading sensor! ', err);
  },

  getSensor: function () {
    if (!this.loaded) {
      actions.server.loadSensor();
    }
    return this.sensor;
  }

});


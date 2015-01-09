'use strict';

var Reflux = require('reflux'),
  actions = require('./actions'),
  _ = require('lodash');

// assert we load that
require('./eventHandler');

module.exports = Reflux.createStore({

  init: function() {
    this.sensor = null;
    this.stats = {temperature: []};

    this.listenToMany(actions.server);
    this.listenToEvents(actions.evt);

    this.actions = Reflux.createActions(['temperatureStatsChanged']);
  },

  // events
  onDiscovered: function (sensor) {
    _.extend(this.sensor, sensor);
    this.sensor.state = 'discovered';

    console.log('updated sensor info: [discovered]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },
  onConnected: function (sensor) {
    _.extend(this.sensor, sensor);
    this.sensor.state = 'connected';

    console.log('updated sensor info: [connected]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  onDisconnected: function (sensor) {
    _.extend(this.sensor, sensor);
    this.sensor.state = 'disconnected';

    console.log('updated sensor info: [disconnected]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  onRssiUpdated: function (rssi) {
    this.sensor.rssi = rssi;

    console.log('updated sensor info: [rssiUpdated]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  onTemperatureChanged: function (temperature) {
    this.sensor.sensorValues.temperature = temperature;

    console.log('updated sensor info: [temperatureChanged]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});

    if (this.stats.temperature.length > 0) {
      this.stats.temperature.push({ date: Date.now(), value: temperature });
      this.actions.temperatureStatsChanged(this.stats.temperature);
    }
  },

  onHumidityChanged: function (humidity) {
    this.sensor.sensorValues.humidity = humidity;

    console.log('updated sensor info: [humidityChanged]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
  },

  onBarometricPressureChanged: function (pressure) {
    this.sensor.sensorValues.barometricPressure = pressure;

    console.log('updated sensor info: [barometricPressureChanged]');

    this.trigger({action: 'sensorInfoChanged', sensor: this.sensor});
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

  getSensor: function () {
    if (!this.loaded) {
      actions.server.loadSensor();
    }
    return this.sensor;
  },

  onLoadTemperatureStats: function () {
    console.log('loading temperature stats.');
  },

  onLoadedTemperatureStats: function (stats) {
    console.log('loaded temperature stats.');
    //this.stats.temperature = stats;
    this.trigger({action: 'loadedTemperatureStats', temperatureStats: this.stats.temperature});
  },

  onFailedLoadingTemperatureStats: function (err) {
    console.log('failed loading temperature stats! ', err);
  },

  getTemperatureStats: function (clb) {
    var self = this;
    actions.server.loadedTemperatureStats.listen(function (temperatureStats) {
      self.stats.temperature = temperatureStats;
      clb(null, temperatureStats);
    });
    actions.server.loadTemperatureStats();
  }

});

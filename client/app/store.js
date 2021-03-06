'use strict';

var Reflux = require('reflux'),
  actions = require('./actions'),
  _ = require('lodash');

// assert we load that
require('./eventHandler');

module.exports = Reflux.createStore({

  init: function() {
    this.sensor = null;

    this.listenToMany(actions.server);
    this.listenToEvents(actions.evt);
  },

  onLoadSensor: function () {
    if (!this.loaded) {
      this.startQueueing();
    }
    console.log('loading sensor.');
  },

  onLoadedSensor: function (sensor) {
    this.loaded = true;
    console.log('loaded sensor.');
    this.sensor = sensor;
    this.trigger({action: 'loadedSensor', sensor: this.sensor});
    this.dequeue();
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
  }

});

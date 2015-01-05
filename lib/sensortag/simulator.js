'use strict';

var logging = require('../logger'),
  EventEmitter = require('events').EventEmitter,
  notifier = new EventEmitter(),
  createEvent = require('./createEvent');

var rssiUpdatedInterval = null,
  temperatureAndHumidityChangedInterval = null,
  barometricPressureChangedInterval = null,
  uuid = '713724cf9f8f4b23827c623c7ddbe0fb',
  localName = 'SensorTag (Simulator)';

var logger;

/**
 * Returns a random number between passed values of min and max.
 * @param {Number} min The minimum value of the resulting random number.
 * @param {Number} max The maximum value of the resulting random number.
 * @returns {Number}
 */
function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function simulateDiscovered() {
  notifier.emit('event', createEvent('discovered', {
    uuid: uuid,
    localName: localName,
    rssi: randomBetween(-99, -20)
  }, uuid));
}

function simulateConnect() {
  notifier.emit('event', createEvent('connected', {
    uuid: uuid,
    localName: localName,
    rssi: randomBetween(-99, -20),
    systemId: '68:a5:4:0:0:19:19:f2',
    firmwareRevision: '1.5 (Oct 23 2013)',
    manufacturerName: 'Texas Instruments'
  }, uuid));

  rssiUpdatedInterval = setInterval(function () {
    notifier.emit('event', createEvent('rssiUpdated', randomBetween(-99, -20), uuid));
  }, 3000);

  temperatureAndHumidityChangedInterval = setInterval(function () {
    notifier.emit('event', createEvent('temperatureChanged', randomBetween(15, 30), uuid));
    notifier.emit('event', createEvent('humidityChanged', randomBetween(20, 80), uuid));
  }, 1000);

  barometricPressureChangedInterval = setInterval(function () {
    notifier.emit('event', createEvent('barometricPressureChanged', randomBetween(950, 980), uuid));
  }, 4000);
}

function simulateDisconnect() {
  notifier.emit('event', createEvent('disconnected', {
    uuid: uuid,
    localName: localName,
    rssi: randomBetween(-99, -20),
    systemId: '68:a5:4:0:0:19:19:f2',
    firmwareRevision: '1.5 (Oct 23 2013)',
    manufacturerName: 'Texas Instruments'
  }, uuid));

  if (rssiUpdatedInterval) {
    clearInterval(rssiUpdatedInterval);
  }

  if (temperatureAndHumidityChangedInterval) {
    clearInterval(temperatureAndHumidityChangedInterval);
  }

  if (barometricPressureChangedInterval) {
    clearInterval(barometricPressureChangedInterval);
  }

  setTimeout(function () {
    simulateDiscovered();
  }, 2000);
}

// commands

notifier.on('command', function (cmd) {
  if (cmd.name === 'connect') {
    simulateConnect();
    return;
  }

  if (cmd.name === 'disconnect') {
    simulateDisconnect();
    return;
  }
});


module.exports = function () {
  logger = logging.getLogger('sensortag:simulator');

  setTimeout(function () {
    simulateDiscovered();
  }, 1000);

  setTimeout(function () {
    simulateConnect();
  }, 3000);

  return notifier;
};

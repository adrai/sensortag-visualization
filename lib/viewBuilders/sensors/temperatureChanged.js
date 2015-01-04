'use strict';

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) {
  vm.set('sensorValues.objectTemperature', data.objectTemperature);
  vm.set('sensorValues.ambientTemperature', data.ambientTemperature);
});

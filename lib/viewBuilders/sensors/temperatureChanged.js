'use strict';

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) {
  vm.set('sensorValues.temperature', data);
});

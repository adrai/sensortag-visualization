'use strict';

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) {
  vm.set(data);
  vm.set('state', 'connected');
});

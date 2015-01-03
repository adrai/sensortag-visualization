module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) { // instead of function you can define a string with default handling ('create', 'update', 'delete')
  vm.set('rssi', data);
});
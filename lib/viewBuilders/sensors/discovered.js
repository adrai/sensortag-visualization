module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) {
  vm.set({
    uuid: data.uuid,
    localName: data.localName,
    rssi: data.rssi
  });
  vm.set('state', 'discovered');
});
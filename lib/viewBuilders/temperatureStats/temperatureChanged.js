'use strict';

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) {
  var entries = vm.get('entries');

  entries.push({
    date: Date.now(),
    value: data
  });

  var secondsInDay = 60 * 60 * 24;

  if (entries.length > secondsInDay) {
    entries.shift();
  }

  vm.set('entries', entries);
});

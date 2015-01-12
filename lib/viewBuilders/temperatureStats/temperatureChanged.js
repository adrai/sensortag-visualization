'use strict';

var _ = require('lodash');

module.exports = require('cqrs-eventdenormalizer').defineViewBuilder({
  id: 'sensorTagId'
}, function (data, vm) {
  var entries = vm.get('entries');

  entries.push({
    date: Date.now(),
    value: data
  });

  var secondsInDay = 60 * 60 * 24;

  entries = _.filter(entries, function (e) {
    return Date.now() <= (e.date + (secondsInDay * 1000));
  });

  vm.set('entries', entries);
});

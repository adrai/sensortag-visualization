'use strict';

var Reflux = require('reflux'),
  actions = require('../..//actions'),
  _ = require('lodash');

// assert we load that
require('../../eventHandler');

module.exports = Reflux.createStore({

  init: function() {
    this.stats = [];

    this.listenToMany(actions.server);
    this.listenToEvents(actions.evt);
  },

  onLoadPressureStats: function () {
    if (!this.loaded) {
      this.startQueueing();
    }
    console.log('loading pressure stats.');
  },

  onLoadedPressureStats: function (stats) {
    this.loaded = true;
    console.log('loaded pressure stats.');
    this.stats = stats;
    this.trigger({action: 'loadedPressureStats', stats: this.stats});
    this.dequeue();
  },

  onFailedLoadingPressureStats: function (err) {
    console.log('failed loading pressure stats! ', err);
  },

  getPressureStats: function () {
    if (!this.loaded) {
      actions.server.loadPressureStats();
    }
    return this.stats;
  },

  // events
  onBarometricPressureChanged: function (humidity) {
    console.log('updated sensor info: [pressureChanged]');

    if (this.stats.length > 0) {
      this.stats.push({ date: Date.now(), value: humidity });

      var secondsInDay = 60 * 60 * 24;
      this.stats = _.filter(this.stats, function (e) {
        return Date.now() <= (e.date + (secondsInDay * 1000));
      });
    }
  }

});

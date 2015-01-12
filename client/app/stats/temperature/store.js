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

  onLoadTemperatureStats: function () {
    if (!this.loaded) {
      this.startQueueing();
    }
    console.log('loading temperature stats.');
  },

  onLoadedTemperatureStats: function (stats) {
    this.loaded = true;
    console.log('loaded temperature stats.');
    this.stats = stats;
    this.trigger({action: 'loadedTemperatureStats', stats: this.stats});
    this.dequeue();
  },

  onFailedLoadingTemperatureStats: function (err) {
    console.log('failed loading temperature stats! ', err);
  },

  getTemperatureStats: function () {
    if (!this.loaded) {
      actions.server.loadTemperatureStats();
    }
    return this.stats;
  },

  // events
  onTemperatureChanged: function (temperature) {
    console.log('updated sensor info: [temperatureChanged]');

    if (this.stats.length > 0) {
      this.stats.push({ date: Date.now(), value: temperature });

      var secondsInDay = 60 * 60 * 24;
      this.stats = _.filter(this.stats, function (e) {
        return Date.now() <= (e.date + (secondsInDay * 1000));
      });
    }
  }

});

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

  onLoadHumidityStats: function () {
    if (!this.loaded) {
      this.startQueueing();
    }
    console.log('loading humidity stats.');
  },

  onLoadedHumidityStats: function (stats) {
    this.loaded = true;
    console.log('loaded humidity stats.');
    this.stats = stats;
    this.trigger({action: 'loadedHumidityStats', stats: this.stats});
    this.dequeue();
  },

  onFailedLoadingHumidityStats: function (err) {
    console.log('failed loading humidity stats! ', err);
  },

  getHumidityStats: function () {
    if (!this.loaded) {
      actions.server.loadHumidityStats();
    }
    return this.stats;
  },

  // events
  onHumidityChanged: function (humidity) {
    console.log('updated sensor info: [humidityChanged]');

    if (this.stats.length > 0) {
      this.stats.push({ date: Date.now(), value: humidity });

      var secondsInDay = 60 * 60 * 24;
      this.stats = _.filter(this.stats, function (e) {
        return Date.now() <= (e.date + (secondsInDay * 1000));
      });
    }
  }

});

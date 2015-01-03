'use strict';

var hub = require('./hub'),
    _ = require('lodash');

// some pseudo code
var EventHandler = function(options) {
  this.listeners = {};
  if (options.parse) this.parse = options.parse;

  this.actions = [];
  if (options.actions) this.bindActions(options.actions);
};

EventHandler.prototype = {

  parse: function(evt) {
    // evt.payload.id = evt.sensorTagId;
    return evt.payload;
  },

  bindActions: function(actions) {
    if (_.isArray(actions)) {
      this.actions = this.actions.concat(actions);
    } else {
      this.actions.push(actions);
    }
  },

  bind: function(options) {
    var self = this;

    if (typeof options === 'string') options = { evt: options };

    if (options.evt && options.evt.indexOf('.') > -1) {
      var p = options.evt.split('.');
      options.eventName = p[0];
    } else {
      options.eventName = options.evt;
    }

    // wire up
    var listenTo = ['event', options.eventName, '*'].join('.');

    var fc = function(evt) {
      var data = options.parse ? options.parse(evt) : self.parse(evt);
      _.each(self.actions, function(act) {
        if (act[options.eventName]) act[options.eventName](data);
      });
    };

    hub.on(listenTo, fc);

    // add
    this.listeners[options.evt] = {
      evt: options.evt,
      listenTo: listenTo,
      fc: fc
    };
  },

  unbind: function(evt) {
    var listener = this.listeners[evt];
    hub.off(listener.listenTo, listener.fc);
  }

};

module.exports = EventHandler;

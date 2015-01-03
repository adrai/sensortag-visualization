'use strict';

var io = require('socket.io-client'),
    uuid = require('./uuid'),
    EE = require('eventemitter2');
if (EE.EventEmitter2) EE = EE.EventEmitter2;

var socket = {

  init: function(options) {
    var self = this;

    this.io = io.connect(options.host);

    this.io.on('disconnect', function(evt) {
      self.emitter.emit('offline');
    });

    this.io.on('connect', function(evt) {
      self.emitter.emit('online');
    });

    // on receiving an event from the server via socket.io
    this.io.on('event', function(evt) {

      function emit() {
        // emit event for callbacks on actions
        self.emitter.emit(['observe', evt.correlationId].join('.'), evt);

        // emit event for denormalizers
        self.emitter.emit(['event', evt.name, evt.sensorTagId].join('.'), evt);
      }

      emit();

    });

  },

  emit: function(data, callback) {
    data.id = uuid.v4();
    console.log('emit cmd: ', data.name);
    this.io.emit('command', data);

    if (callback) {
      this.once('observe.' + data.id, callback);
    }

    return data;
  },

  // composition of eventemitter
  emitter: new EE({ wildcard: true, maxListener: 9999999 }),
  on: function() { this.emitter.on.apply(this.emitter, arguments); },
  off: function() { this.emitter.off.apply(this.emitter, arguments); },
  once: function() { this.emitter.once.apply(this.emitter, arguments); },
  onAny: function() { this.emitter.onAny.apply(this.emitter, arguments); }

};

module.exports = socket;

'use strict';

var hub = require('./hub'),
  _ = require('lodash');

// some pseudo code
var Command = function(name, sensorTagId, payload) {
  var self = this;

  var cmd = {
    name: name,
    payload: payload,
    sensorTagId: sensorTagId
  };

  this._cmd = cmd;
};

Command.prototype = {
  emit: function(cb) {
    hub.emit(this._cmd, cb);
  }
};

module.exports = Command;

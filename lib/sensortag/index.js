'use strict';

var simulator = require('./simulator'),
  real = require('./real');

var instance = null;

module.exports = function (enableSimulation) {
  if (!instance) {
    if (enableSimulation) {
      instance = simulator();
    } else {
      instance = real();
    }
  }

  return instance;
};

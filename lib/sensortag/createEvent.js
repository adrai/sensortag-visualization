'use strict';

var uuid = require('node-uuid').v4;

module.exports = function createEvent (name, payload, tagId, correlationId) {
  return {
    id: uuid().toString(),
    name: name,
    payload: payload,
    sensorTagId: tagId,
    correlationId: correlationId
  };
};

'use strict';

module.exports = require('cqrs-eventdenormalizer').defineCollection(
  {
    defaultPayload: 'payload'//,
    //indexes: [
    //  'type'
    //]
  },
  {
    entries: []
  }
);

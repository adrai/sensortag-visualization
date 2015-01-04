'use strict';

module.exports = require('cqrs-eventdenormalizer').defineCollection(
  {
    defaultPayload: 'payload'//,
    //indexes: [ // for tingodb
    //  'profileId',
    //  // or:
    //  { profileId: 1 },
    //  // or:
    //  { index: {profileId: 1}, options: {} }
    //]
  },
  {
    sensorValues: {}
  }
);

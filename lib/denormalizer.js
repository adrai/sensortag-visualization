'use strict';

var eventdenormalizer = require('cqrs-eventdenormalizer'),
  path = require('path'),
  logging = require('./logger');

module.exports = function (options, callback) {
  var logger = logging.getLogger('denormalizer');

  var denormalizer = eventdenormalizer({
    denormalizerPath: path.join(__dirname, '/viewBuilders'),
    repository: options,
  });

  denormalizer.repository.on('disconnect', function () {
    logger.warn('Killing myself, since I got a disconnect from the repository...');
    /*eslint no-process-exit:0*/
    process.exit(1);
  });

  denormalizer.defineEvent({
    id: 'id',
    name: 'name',
    aggregateId: 'sensorTagId',
    payload: 'payload'
  });

  denormalizer.init(function (err) {
    if (err) {
      logger.error(err);
      callback(err);
      return;
    }

    logger.info('successfully initialized denormalizer');

    callback(null, denormalizer);
  });
};

'use strict';

var viewmodel = require('viewmodel'),
  logging = require('./logger');

module.exports = function (options, callback) {
  var logger = logging.getLogger('repository');

  viewmodel.write(options, function (err, repository) {
    if (err) {
      logger.error(err);
      callback(err);
      return;
    }

    repository.on('disconnect', function () {
      logger.warn('Killing myself, since I got a disconnect from the repository...');
      /*eslint no-process-exit:0*/
      process.exit(1);
    });

    logger.info('successfully initialized viewmodel');

    callback(null, repository);
  });
};
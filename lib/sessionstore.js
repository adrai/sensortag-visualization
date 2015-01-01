'use strict';

var sessionstore = require('sessionstore'),
  logging = require('./logger');

module.exports = function (options, callback) {
  var logger = logging.getLogger('sessionstore');

  sessionstore.createSessionStore(options, function (err, ss) {
    if (err) {
      return callback(err);
    }

    ss.on('disconnect', function () {
      logger.warn('Killing myself, since I got a disconnect from the sessionstore...');
      /*eslint no-process-exit:0*/
      process.exit(1);
    });

    callback(null, ss);
  });
};
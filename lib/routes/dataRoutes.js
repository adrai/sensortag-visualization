'use strict';

var responseHandler = require('../responseHandler'),
  logging = require('../logger');

module.exports.getRouteDefinitions = function (repo) {

  var logger = logging.getLogger('dataRoutes');

  var sensorsRepo = repo.extend({ collectionName: 'sensors' });

  return {
    '/data/sensor': function (req, res) {
      sensorsRepo.find({}, function (err, items) {
        if (!items || items.length === 0) {
          return responseHandler.send(err, { sensor: null }, res);
        }

        if (items.length > 1) {
          logger.warn('detected "' + items.length + '" sensors, but returning only the first');
        }
        responseHandler.send(err, { sensor: items[0] }, res);
      });
    }
  };
};

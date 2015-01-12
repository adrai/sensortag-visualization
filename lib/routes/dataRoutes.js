'use strict';

var responseHandler = require('../responseHandler'),
  logging = require('../logger');

module.exports.getRouteDefinitions = function (repo) {

  var logger = logging.getLogger('dataRoutes');

  var sensorsRepo = repo.extend({ collectionName: 'sensors' });
  var temperatureStatsRepo = repo.extend({ collectionName: 'temperatureStats' });
  var humidityStatsRepo = repo.extend({ collectionName: 'humidityStats' });
  var pressureStatsRepo = repo.extend({ collectionName: 'pressureStats' });

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
    },

    '/data/stats/temperature': function (req, res) {
      temperatureStatsRepo.find({}, function (err, items) {
        if (!items || items.length === 0) {
          return responseHandler.send(err, { stats: [] }, res);
        }

        if (items.length > 1) {
          logger.warn('detected "' + items.length + '" sensors, but returning only the first');
        }

        var stats = items[0].get('entries');

        responseHandler.send(err, { stats: stats }, res);
      });
    },

    '/data/stats/humidity': function (req, res) {
      humidityStatsRepo.find({}, function (err, items) {
        if (!items || items.length === 0) {
          return responseHandler.send(err, { stats: [] }, res);
        }

        if (items.length > 1) {
          logger.warn('detected "' + items.length + '" sensors, but returning only the first');
        }

        var stats = items[0].get('entries');

        responseHandler.send(err, { stats: stats }, res);
      });
    },

    '/data/stats/pressure': function (req, res) {
      pressureStatsRepo.find({}, function (err, items) {
        if (!items || items.length === 0) {
          return responseHandler.send(err, { stats: [] }, res);
        }

        if (items.length > 1) {
          logger.warn('detected "' + items.length + '" sensors, but returning only the first');
        }

        var stats = items[0].get('entries');

        responseHandler.send(err, { stats: stats }, res);
      });
    }
  };
};

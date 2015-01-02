'use strict';

var responseHandler = require('../responseHandler');

module.exports.getRouteDefinitions = function (repo) {

  var sensorsRepo = repo.extend({ collectionName: 'sensors' });

  return {
    '/data/sensor': function (req, res) {
      sensorsRepo.find({}, function (err, items) {
        if (!items || items.length === 0) {
          return responseHandler.send(err, { sensor: null }, res);
        }
        responseHandler.send(err, { sensor: items[0] }, res);
      });
    }
  };
};

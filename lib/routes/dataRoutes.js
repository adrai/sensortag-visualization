'use strict';

var responseHandler = require('../responseHandler');

module.exports.getRouteDefinitions = function (repo) {

  var dataRepo = repo.extend({ collectionName: 'datas' });

  return {
    '/data': function (req, res) {
      dataRepo.find({}, function (err, items) {
        responseHandler.send(err, { data: items }, res);
      });
    }
  };
};

'use strict';

var request = require('superagent');

var api = {

  getSensor: function(callback) {
    request.get('/data/sensor', function (res) {
      if (!res || !res.body || !res.body.response || !res.body.response.sensor) {
        return callback(null, null);
      }
      return callback(null, res.body.response.sensor);
    });
  }

};

module.exports = api;

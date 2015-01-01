'use strict';

var path = require('path');

module.exports = function (options) {
  return function (req, res) {
    res.contentType('text/html; charset=utf8');

    // if (options.hot) {
      return res.sendFile(path.join(__dirname, '../client/index.html'));
    // }

    // var prerenderApplication = require('../client/build/prerender/main.js'),
    // stats = require('../client/build/stats.json');

    // var STYLE_URL = '/main.css?' + stats.hash,
    //     SCRIPT_URL = '/' + [].concat(stats.assetsByChunkName.main)[0],
    //     COMMONS_URL = '/' + [].concat(stats.assetsByChunkName.commons)[0];

    // prerenderApplication(SCRIPT_URL, STYLE_URL, COMMONS_URL, req.path, function(err, page) {
    //   if (err) { res.end(err); }
    //   res.end(page);
    // });

  };
};

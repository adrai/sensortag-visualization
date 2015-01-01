/**
 * Utility module to send standardized error and success responses to the client.
 * Prefer these methods over invoking functions on httpResponse directly.
 */

'use strict';

var _ = require('lodash');

function addNoCacheHeadersIfRequired(res, options) {
  if (!_.isUndefined(options) && options.nocache) {
    res.header('Cache-Control', 'no-cache, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', -1);
  }
}

function respond(response, body, options) {
  addNoCacheHeadersIfRequired(response, options);
  if (_.isFunction(response.contentType)) {
    response.contentType('application/json');
  }
  response.json(body);
  response.status(body.statusCode);
}

var responseHandler = {
  success: function (payload, response, options) {
    var ret = {
      'status': 'OK',
      'response': payload
    };

    respond(response, ret, options);
  },

  error: function (error, response, options) {
    if (!_.isUndefined(options) && !_.isUndefined(options.statusCode)) {
      response.statusCode = options.statusCode;
    } else {
      response.statusCode = 400;
    }
    var ret = {
      'status': 'ERROR',
      'response': error,
      'statusCode': response.statusCode
    };

    respond(response, ret, options);
  },

  notFound: function (response) {
    this.error('Not found', response, { statusCode: 404 });
  },

  notAuthorized: function (response) {
    this.error('Not authorized', response, { statusCode: 401 });
  },

  send: function (error, payload, res, options) {
    if (error) {
      responseHandler.error(error, res, options);
    } else {
      responseHandler.success(payload, res, options);
    }
  }
};

module.exports = responseHandler;

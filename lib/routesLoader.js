'use strict';

var fs = require('fs'),
  path = require('path'),
  _ = require('lodash');

function resolveRoute (value, key) {
  var method, rPath, handles;

  if (_.isString(key)) {
    method = 'get';
    rPath = key;

    if (_.isArray(value)) { // { '/my/route': [function (req, res) {}] }
      handles = value;
    } else { // { '/my/route': function (req, res) {} }
      handles = [value];
    }
  } else {
    method = value.method || 'get';
    rPath = value.route;

    if (_.isArray(value.handle)) { // { route: '/my/route', handle: [function (req, res) {}] }
      handles = value.handle;
    } else { // { route: '/my/route', handle: function (req, res) {} }
      handles = [value.handle];
    }
  }

  return {
    method: method,
    path: rPath,
    handles: handles
  };
}

function loadRoutes (directory, argsToPass) {
  argsToPass = argsToPass || [];

  var loadedRoutes = [];

  fs.readdirSync(directory).forEach(function (fileName) {
    var joinedPath = path.join(directory, fileName);
    if (fs.lstatSync(joinedPath).isDirectory()) {
      loadedRoutes = loadedRoutes.concat(loadRoutes(joinedPath, argsToPass));
    } else {
      if (path.extname(fileName) === '.js') {
        var required = require(joinedPath);
        if (_.isFunction(required.getRouteDefinitions)) {
          var routes = required.getRouteDefinitions.apply(required, argsToPass);
          _.each(routes, function (value, key) {
            var route = resolveRoute(value, key);
            loadedRoutes.push(route);
          });
        }
      }
    }
  });

  return loadedRoutes;
}

module.exports = loadRoutes;

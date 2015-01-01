'use strict';

var _ = require('lodash'),
  express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  compression = require('compression'),
  errorhandler = require('errorhandler'),
  helmet = require('helmet'),
  http = require('http'),
  logging = require('./logger');

function Webserver (options) {
  this.logger = logging.getLogger('webserver');

  var defaults = {
    cacheDuration: 7 * 24 * 60 * 60 * 1000,
    statics: {}
  };

  _.defaults(options, defaults);

  this.options = options;

  var app = this.app = express();

  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // assets
  if (options.hot) {
    // proxy to hot-dev-server
    var proxy = require('proxy-middleware');
    var url = require('url');
    app.use('/assets', proxy(url.parse('http://localhost:' + options.hot.port + '/assets')));
  }

  // production only
  if (app.get('env') === 'production') {
    app.use(compression());
    app.use(errorhandler());
    _.each(this.options.statics, function (directory, path) {
      app.use(path, express.static(directory, {maxAge: options.cacheDuration}));
    });
  } else {
    app.use(errorhandler({ dumpExceptions: true, showStack: true }));
    _.each(this.options.statics, function (directory, path) {
      app.use(path, express.static(directory));
    });
  }
}

_.extend(Webserver.prototype, {

  getAppHandle: function () {
    return this.app;
  },

  useSessionStore: function (sessionstore) {
    this.app.use(session({
      secret: this.options.sessionSecret,
      name: this.options.sessionKey,
      store: sessionstore,
      resave: true,
      saveUninitialized: true
    }));
    return this;
  },

  addRoutes: function (routes) {
    var self = this;

    _.each(routes, function (route) {
      self.logger.debug('Registering route ' + '"' + route.method + '": ' + route.path);
      var args = [route.path].concat(route.handles);
      self.app[route.method].apply(self.app, args);
    });

    if (!this.httpHandle) {
      this.httpHandle = http.createServer(this.app);
    }
    return this;
  },

  lastRouteHandle: function (lastRouteFn) {
    this.lastRouteFn = lastRouteFn;
    if (!this.httpHandle) {
      this.httpHandle = http.createServer(this.app);
    }
    return this;
  },

  getHttpHandle: function () {
    return this.httpHandle;
  },

  listen: function () {
    if (!this.httpHandle) {
      this.httpHandle = http.createServer(this.app);
    }
    this.app.get('/health-check', function(req, res) {
      res.statusCode = '204';
      res.end();
    });
    
    if (this.lastRouteFn) {
      this.app.use(this.lastRouteFn);
    }

    this.httpHandle.listen(this.options.port);
    this.logger.info('Started webserver on port ' + this.options.port);
  }

});

module.exports = function (options) {
  return new Webserver(options);
};

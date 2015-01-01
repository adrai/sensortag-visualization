var winston = require('winston'),
  _ = require('lodash');

var LOGGER_METHODS = ['silly', 'debug', 'info', 'warn', 'error'];

/**
 * creates a new Named Logger
 * @param componentName
 * @param baseLogger
 * @constructor
 */
function NamedLogger(componentName, baseLogger) {
  if (_.isUndefined(componentName)) {
    throw new Error('Please specify a component Name for your Logger!');
  }
  this.componentName = componentName;
  this.baseLogger = baseLogger;
  this.level = baseLogger.level;

  polyfillNamedLogger(this);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function prependComponentName(componentName, args) {
  if (!_.isUndefined(args) && args.length > 0) {
    if (_.isString(args[0])) {
      args[0] = '[' + componentName + '] ' + args[0];
    } else {
      args.unshift('[' + componentName + ']');
    }
  }
  return args;
}

function polyfillNamedLogger(namedLogger) {
  var winstonLogger = namedLogger.baseLogger.winstonLogger;

  LOGGER_METHODS.forEach(function (logMethod) {
    if (_.isUndefined(winstonLogger[logMethod])) {
      // skip unknown methods
      return;
    }

    // method to check log level
    namedLogger['is' + capitalize(logMethod)] = function () {
      return this.baseLogger.level === logMethod;
    };

    // the actual log method
    namedLogger[logMethod] = function () {
      // our code often calls logger.error('something', error),
      // thus the error stack gets lost, since an error 'toString' becomes an empty string
      // so in case of an error object, transform it to the error's stack
      var args = _.map(arguments, function (argument) {
        return (argument instanceof Error) ? argument.stack : argument;
      });

      args = prependComponentName(namedLogger.componentName, args);

      winstonLogger[logMethod].apply(winstonLogger, args);
    };
  });

}

function normalizeOptions(options) {
  options = options || {};

  var defaults = {
    timestamp: true,
    level: 'info',
    colorize: true,
    enableWebLog: false
  };

  _.defaults(options, defaults);

  return options;
}

function initWinstonLogger(options) {
  var winstonLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(options)
    ]
  });

  if (options.host && options.port) {
    require('winston-logstash');
    winstonLogger.add(winston.transports.Logstash, options);
  }

  return winstonLogger;
}

function initExpressJsWeblog() {
  var self = this;
  this.stream = {
    write: function (str) {
      self.winstonLogger.debug(str);
    }
  };
}

function BaseLogger(options) {
  options = normalizeOptions(options);

  this.level = options.level;
  this.winstonLogger = initWinstonLogger(options);

  if (options.enableWebLog) {
    initExpressJsWeblog.call(this);
  }
}

/**
 * will return a new logger instance for a named component.
 * This will NOT open a new transport, instead will use the winston logger of this base logger
 */
function getLogger(componentName, baseLogger) {
  return new NamedLogger(componentName, baseLogger);
}


module.exports = {

  init: function (options) {
    if (this.baseLogger) {
      throw new Error('BaseLogger already initialized! Use require("taibika-logging").getLogger("MyComponent");');
    }
    this.baseLogger = new BaseLogger(options);
    return this;
  },

  getLogger: function (componentName) {
    if (!this.baseLogger) {
      throw new Error('Please initialize BaseLogger first!');
    }
    return getLogger(componentName, this.baseLogger);
  }

};

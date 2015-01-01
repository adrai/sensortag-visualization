var expect = require('expect.js');

// #log() is handled separately
var EXPECTED_LOGGER_METHODS = ['silly', 'debug', 'info', 'warn', 'error'];

describe('Logger', function () {

  describe('instantiate logger', function () {

    afterEach(function () {
      require('../lib/logger').baseLogger = undefined;
    });

    it('should instantiate logger with default options', function () {
      require('../lib/logger').init();

      var initializedBaseLogger = require('../lib/logger').baseLogger;
      expect(initializedBaseLogger).not.to.be(undefined);
    });

    it('should not allow multiple instantiations of logger', function () {
      require('../lib/logger').init();

      expect(function () {
        require('../lib/logger').init();
      }).to.throwError();

    });

    it('should instantiate logger with weblog enabled', function () {

      require('../lib/logger').init({
        enableWebLog: true
      });

      var initializedBaseLogger = require('../lib/logger').baseLogger;
      expect(initializedBaseLogger).not.to.be(undefined);
      expect(initializedBaseLogger.stream).not.to.be(undefined);
      expect(initializedBaseLogger.stream.write).not.to.be(undefined);
    });

    it('should instantiate logger with custom level', function () {

      require('../lib/logger').init({
        level: 'debug'
      });

      var initializedBaseLogger = require('../lib/logger').baseLogger;
      expect(initializedBaseLogger).not.to.be(undefined);
      expect(initializedBaseLogger.level).to.be('debug');
    });

  });

  describe('#getLogger()', function () {

    afterEach(function () {
      require('../lib/logger').baseLogger = undefined;
    });

    it('should not return logger instance without init', function () {
      expect(function () {
        require('../lib/logger').getLogger('SomeComponent');
      }).to.throwError();
    });


    it('should return new named Logger instance', function () {
      require('../lib/logger').init();
      var logger = require('../lib/logger').getLogger('SomeComponent');

      expect(logger).not.to.be(undefined);

      EXPECTED_LOGGER_METHODS.forEach(function (logMethod) {
        expect(logger[logMethod]).not.to.be(undefined);
      });

    });

  });


  describe('check log level', function () {

    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    EXPECTED_LOGGER_METHODS.forEach(function (logMethod) {
      beforeEach(function () {
        require('../lib/logger').baseLogger = undefined;
      });
      it('should correctly return loglevel', function () {
        var LOGGER = require('../lib/logger').init({
          level: logMethod
        }).getLogger('some');

        var logLevelCheckMethodName = 'is' + capitalize(logMethod);
        expect(LOGGER[logLevelCheckMethodName]).to.be.a('function');
        expect(LOGGER[logLevelCheckMethodName]()).to.be(true);

      })
    });


  });

  describe('logging-methods', function () {

    var fakeWinstonLogger = {}, invokedWinstonFunctions;

    EXPECTED_LOGGER_METHODS.forEach(function (logMethod) {
      fakeWinstonLogger[logMethod] = function () {
        invokedWinstonFunctions.push({logMethod: logMethod, args: arguments});
      };
    });

    beforeEach(function () {
      invokedWinstonFunctions = [];

      require('../lib/logger').baseLogger = undefined;
      require('../lib/logger').init({
        level: 'debug'
      });
      require('../lib/logger').baseLogger.winstonLogger = fakeWinstonLogger;
    });

    afterEach(function () {
      require('../lib/logger').baseLogger = undefined;
    });

    // for every log method (debug/info/warn/error)
    EXPECTED_LOGGER_METHODS.forEach(function (logMethod) {

      it('should be able to invoke ' + logMethod + ' with string formatting', function () {
        var logger = require('../lib/logger').getLogger('SomeComponent');
        logger[logMethod]('this is some %s', 'message');

        expect(invokedWinstonFunctions.length).to.be(1);
        expect(invokedWinstonFunctions[0].logMethod).to.be(logMethod);
        expect(invokedWinstonFunctions[0].args.length).to.be(2);
        expect(invokedWinstonFunctions[0].args[0]).to.be('[SomeComponent] this is some %s');
        expect(invokedWinstonFunctions[0].args[1]).to.be('message');
      });

      it('should be able to invoke ' + logMethod + '  with objects', function () {
        var logger = require('../lib/logger').getLogger('SomeComponent2');
        logger[logMethod]({my: 'object'});

        expect(invokedWinstonFunctions.length).to.be(1);
        expect(invokedWinstonFunctions[0].logMethod).to.be(logMethod);
        expect(invokedWinstonFunctions[0].args.length).to.be(2);
        expect(invokedWinstonFunctions[0].args[0]).to.be('[SomeComponent2]');
        expect(invokedWinstonFunctions[0].args[1]).to.eql({my: 'object'});

      });

      it('should correctly insert componentName in ' + logMethod, function () {
        var loggerA = require('../lib/logger').getLogger('SomeComponentA');
        var loggerB = require('../lib/logger').getLogger('SomeComponentB');
        loggerA[logMethod]({my: 'object'});
        loggerB[logMethod]({my: 'objectB'});

        expect(invokedWinstonFunctions.length).to.be(2);
        expect(invokedWinstonFunctions[0].logMethod).to.be(logMethod);
        expect(invokedWinstonFunctions[0].args.length).to.be(2);
        expect(invokedWinstonFunctions[0].args[0]).to.be('[SomeComponentA]');
        expect(invokedWinstonFunctions[0].args[1]).to.eql({my: 'object'});
        expect(invokedWinstonFunctions[1].logMethod).to.be(logMethod);
        expect(invokedWinstonFunctions[1].args.length).to.be(2);
        expect(invokedWinstonFunctions[1].args[0]).to.be('[SomeComponentB]');
        expect(invokedWinstonFunctions[1].args[1]).to.eql({my: 'objectB'});

      });

    });

    it('should be able to invoke #log()', function () {
      var logger = require('../lib/logger').getLogger('SomeComponent');
      logger.info('some %s string with "log()"', 'formatted');
    });

  });

});

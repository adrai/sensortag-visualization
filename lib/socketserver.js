'use strict';

var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  _ = require('lodash'),
  io = require('socket.io'),
  logging = require('./logger');

function Socketserver (options) {
  EventEmitter.call(this);

  this.logger = logging.getLogger('socketserver');

  var defaults = {
    sessionKey: 'please set a sessionKey',
    sessionSecret: 'please set a sessionSecret'
  };

  _.defaults(options, defaults);

  this.options = options;

  var self = this;

  this.all = {
    emit: function () {
      self.ioServer.sockets.emit.apply(self.ioServer.sockets, _.toArray(arguments));
    }
  }
}

util.inherits(Socketserver, EventEmitter);

_.extend(Socketserver.prototype, {

  handleNewSocket: function (socket) {
    this.logger.debug('new websocket connection opened for id ' + socket.id);

    var self = this;

    socket.on('command', function (cmd) {
      self.logger.debug('(client -> host) | Received COMMAND "' + cmd.name + '" with userId: "' + socket.id + '"');

      self.emit('command', cmd, socket);
    });

    socket.on('disconnect', function (event) {
      self.logger.debug('disconnected websocket connection for user ' + socket.id + '(' + event + ')');

      self.emit('disconnect', socket);
    });

    this.emit('connection', socket);
  },

  checkIfReady: function () {
    if (!this.sessionstore || !this.ioServer) {
      return;
    }

    var self = this;
    this.ioServer.on('connection', function (socket) {
      self.handleNewSocket(socket);
    });
    this.logger.info('Started socketserver');
  },

  useSessionStore: function (sessionstore) {
    this.sessionstore = sessionstore;
    this.checkIfReady();
    return this;
  },

  useHttpHandle: function (httpHandle) {
    this.ioServer = io.listen(httpHandle);
    this.checkIfReady();
    return this;
  }

});

module.exports = function (options) {
  return new Socketserver(options);
};

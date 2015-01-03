'use strict';

var EventHandler = require('../common/eventHandler'),
    actions = require('./actions');

var handler = new EventHandler({
  actions: actions.evt      // or array of actions
});

handler.bind('discovered');
handler.bind('connected');
handler.bind('disconnected');
handler.bind('rssiUpdated');

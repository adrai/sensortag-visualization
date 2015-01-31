/** @jsx React.DOM */
'use strict';

var injectTapEventPlugin = require('react-tap-event-plugin');

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

var _ = require('lodash'), /*EE = require('eventemitter2'),*/
    Reflux = require('reflux');

Reflux.nextTick(process.nextTick);
//Reflux.setEventEmitter(EE);

var orgFunction = Reflux.createStore;

// helpers
function callbackName(string){
  return 'on' + string.charAt(0).toUpperCase() + string.slice(1);
}
function addQueueHandler(context, fcName) {
  context['_' + fcName] = function() {
    if (context.cacheEvents) {
      context.queue.push({
        handler: fcName,
        args: arguments
      });
    } else {
      context[fcName].apply(context, arguments);
    }
  };
  return '_' + fcName;
}

Reflux.createStore = function (definitions) {
  _.extend(definitions, {

    queue: [],

    cacheEvents: true,

    dequeue: function () {
      while (this.queue.length > 0) {
        var evt = this.queue.shift();
        console.log(evt);
        this[evt.handler].apply(this, evt.args);
      }
      this.cacheEvents = false;
    },

    startQueueing: function () {
      this.cacheEvents = true;
    },

    listenToEvents: function(listenables) {
      for(var key in listenables){
        var cbname = callbackName(key),
            localname = this[cbname] ? cbname : this[key] ? key : undefined;
        if (localname){
          var interceptedName = addQueueHandler(this, localname);
          this.listenTo(listenables[key], interceptedName, this[cbname + "Default"] || this[localname + "Default"] || localname);
        }
      }
    }
  });

  return orgFunction.call(Reflux, definitions);
}

// todo expose react for dev-tools only if we are on hot-develop-server
window.React = require('react');

// shims
if (!Object.assign) {
  Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      if (target === undefined || target === null)
        throw new TypeError("Cannot convert first argument to object");
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) continue;
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
        }
      }
      return to;
    }
  });
}

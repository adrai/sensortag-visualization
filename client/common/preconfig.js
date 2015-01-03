/** @jsx React.DOM */
'use strict';

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
    context[fcName].apply(context, arguments);
  };
  return '_' + fcName;
}

Reflux.createStore = function (definitions) {
  _.extend(definitions, {
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

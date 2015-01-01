var Reflux = require('reflux');
var _ = require('lodash');
var Todo = require('../actions/todo');

var TodoStore = Reflux.createStore({

  list: [],

  getDefaultData() {
    return this.list;
  }
});


module.exports = TodoStore;

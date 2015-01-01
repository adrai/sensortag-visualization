var React = require('react');
var AsyncReactComponent = require('../../mixins/async');

module.exports = React.createClass({

  mixins: [AsyncReactComponent],

  bundle: require('bundle?lazy!./home.js'),

  preRender() {
    return <div>Loading...</div>
  }
});
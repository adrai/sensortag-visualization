var React = require('react');
var AsyncReactComponent = require('../../common/async');

module.exports = React.createClass({

  mixins: [AsyncReactComponent],

  bundle: require('bundle?lazy!./stats.jsx'),

  preRender: function () {
    return <div><i className="fa fa-spinner fa-spin"></i> Loading...</div>
  }
});

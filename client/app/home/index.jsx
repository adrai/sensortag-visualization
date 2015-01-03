var React = require('react');
var AsyncReactComponent = require('../../common/async');

module.exports = React.createClass({

  mixins: [AsyncReactComponent],

  bundle: require('bundle?lazy!./home.jsx'),

  preRender: function () {
    return <div><i className="fa fa-spinner fa-spin"></i> Loading...</div>
  }
});

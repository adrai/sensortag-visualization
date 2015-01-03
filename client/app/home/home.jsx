var React = require('react'),
  Reflux = require('reflux');

var ReactBootstrap = require('react-bootstrap'),
  Panel = ReactBootstrap.Panel,
  ListGroup = ReactBootstrap.ListGroup,
  ListGroupItem = ReactBootstrap.ListGroupItem,
  Label = ReactBootstrap.Label,
  store = require('../store');

var Home = React.createClass({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    sensor: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      sensor: store.getSensor()
    };
  },

  componentDidMount: function () {
    this.listenTo(store, this.onChange);
  },

  onChange: function (data) {
    this.setState(this.getInitialState());
  },

  render: function () {
    var presentData = this.state.sensor ? this.state.sensor : {};

    var list = [];
    for (var m in presentData) {
      list.push(<ListGroupItem><Label>{m}:</Label> {presentData[m]}</ListGroupItem>);
    }

    return (
      <div>
        <div>Home</div>
        <div>Hi @adrai</div>
        <Panel header={presentData.localName}>
          <ListGroup>
            {list}
          </ListGroup>
        </Panel>
      </div>
    );
  }
});

module.exports = Home;

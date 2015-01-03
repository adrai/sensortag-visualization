var React = require('react'),
  Reflux = require('reflux');

var ReactBootstrap = require('react-bootstrap'),
  Panel = ReactBootstrap.Panel,
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

    var connectionState = (
      <div className="alert alert-danger" role="alert">
        <span className="fa fa-unlink" aria-hidden="true"></span> Not Connected!
      </div>
    );

    if (presentData.state === 'connected') {
      connectionState = (
        <div className="alert alert-success" role="alert">
          <span className="fa fa-link" aria-hidden="true"></span> Connected!
        </div>
      );
    } else if (presentData.state === 'discovered') {
      connectionState = (
        <div className="alert alert-warning" role="alert">
          <span className="fa fa-unlink" aria-hidden="true"></span> Discovered!
        </div>
      );
    }

    return (
      <div>
        <Panel header={presentData.localName + ' (' + presentData.uuid + ')'}>
          {connectionState}
          <dl className="dl-horizontal">
            <dt>uuid</dt>
            <dd>{presentData.uuid}</dd>
            <dt>name</dt>
            <dd>{presentData.localName}</dd>
            <dt>system id</dt>
            <dd>{presentData.systemId}</dd>
            <dt>manufacturer name</dt>
            <dd>{presentData.manufacturerName}</dd>
            <dt>firmware revision</dt>
            <dd>{presentData.firmwareRevision}</dd>
            <dt><i className="fa fa-wifi"></i> rssi</dt>
            <dd>{presentData.rssi}</dd>
            <dt>state</dt>
            <dd>{presentData.state}</dd>
          </dl>
        </Panel>
      </div>
    );
  }
});

module.exports = Home;

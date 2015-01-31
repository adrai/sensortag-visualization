var React = require('react'),
  Reflux = require('reflux');

var ReactBootstrap = require('react-bootstrap'),
  Panel = ReactBootstrap.Panel,
  PanelGroup = ReactBootstrap.PanelGroup,
  Button = ReactBootstrap.Button,
  store = require('../store'),
  actions = require('../actions');

var mui = require('material-ui'),
  Tabs = mui.Tabs,
  Tab = mui.Tab;

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

  onConnect: function () {
    actions.cmd.connect(this.state.sensor.id, function (evt) { console.log(evt); });
  },

  onDisconnect: function () {
    actions.cmd.disconnect(this.state.sensor.id, function (evt) { console.log(evt); });
  },

  render: function () {
    var presentData = this.state.sensor ? this.state.sensor : { sensorValues: {} };

    var divStyle = {'marginTop': -6};

    var connectionState = (
      <div className="alert alert-danger" role="alert">
        <span className="fa fa-unlink " aria-hidden="true"></span> Not Connected!
        <Button className="pull-right" style={divStyle} onClick={this.onConnect}>connect</Button>
      </div>
    );

    if (presentData.state === 'connected') {
      connectionState = (
        <div className="alert alert-success" role="alert">
          <span className="fa fa-link" aria-hidden="true"></span> Connected!
          <Button className="pull-right" style={divStyle} onClick={this.onDisconnect}>disconnect</Button>
        </div>
      );
    } else if (presentData.state === 'discovered') {
      connectionState = (
        <div className="alert alert-warning" role="alert">
          <span className="fa fa-unlink" aria-hidden="true"></span> Discovered!
          <Button className="pull-right" style={divStyle} onClick={this.onConnect}>connect</Button>
        </div>
      );
    }

    var marginTop = { 'margin-top': 10 };

    var detailPanel = (
      <Tab label='sensor values'>
        {connectionState}
        <dl style={marginTop} className="dl-horizontal">
          <dt>no sensor values at the moment</dt>
        </dl>
      </Tab>
    );

    if (presentData.state === 'connected') {
      detailPanel = (
        <Tab label='sensor values'> 
          <dl style={marginTop} className="dl-horizontal">
            <dt>temperature</dt>
            <dd>{presentData.sensorValues.temperature} °C</dd>
            <dt>humidity</dt>
            <dd>{presentData.sensorValues.humidity}% rH</dd>
            <dt>pressure</dt>
            <dd>{presentData.sensorValues.barometricPressure} hPa (1 hPa = 1 mBar)</dd>
          </dl>
        </Tab>
      );
    }

    var marginLeft = { 'margin-left': 10 };

    return (
      <div>
        <div>
          <h3 style={marginLeft}>{presentData.localName /*+ ' (' + presentData.uuid + ')'*/}</h3>
        </div>
        <Tabs>
          {detailPanel}
          <Tab label='device'> 
            {connectionState}
            <dl className="dl-horizontal" style={marginTop}>
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
              <dd>{presentData.rssi} dBm</dd>
              <dt>state</dt>
              <dd>{presentData.state}</dd>
            </dl>
          </Tab>
        </Tabs>
      </div>
    );
  }
});

module.exports = Home;

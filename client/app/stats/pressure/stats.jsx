var React = require('react'),
  Reflux = require('reflux');

var ReactBootstrap = require('react-bootstrap'),
  Panel = ReactBootstrap.Panel,
  PanelGroup = ReactBootstrap.PanelGroup,
  Button = ReactBootstrap.Button,
  rd3 = require('react-d3'),
  AreaChart = rd3.AreaChart,
  storeSensor = require('../../store'),
  store = require('./store'),
  actions = require('../../actions'),
  _ = require('lodash');

var Home = React.createClass({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    sensor: React.PropTypes.object,
    stats: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      sensor: storeSensor.getSensor(),
      stats: store.getPressureStats()
    };
  },

  componentDidMount: function () {
    this.listenTo(storeSensor, this.onChange);
    this.listenTo(store, this.onChange);
  },

  onChange: function (data) {
    this.setState(this.getInitialState());
  },

  render: function () {
    var sensorData = this.state.sensor ? this.state.sensor : { sensorValues: {} };
    var statsData = this.state.stats ? this.state.stats : [];

    return (
      <div>
        <PanelGroup defaultActiveKey='1'>
          <Panel header={sensorData.localName + ' (' + sensorData.uuid + ') humidity'} eventKey='1'>
            <AreaChart
              data={statsData}
              width={400}
              height={300}
              yAxisTickCount={4}
              xAxisTickInterval={{unit: 'minute', interval: 10}}
              title='Humidity Chart'
            />
          </Panel>
        </PanelGroup>
      </div>
    );
  }
});

module.exports = Home;

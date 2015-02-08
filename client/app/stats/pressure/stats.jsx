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
  env = require('../../../common/env'),
  _ = require('lodash');

var Home = React.createClass({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    chartWidth: React.PropTypes.number,
    sensor: React.PropTypes.object,
    stats: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      chartWidth: env.window.width - 100,
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

    var interval = 1;
    if (this.state.chartWidth/24 < 20) {
      interval = 3
    }

    return (
      <div>
        <PanelGroup defaultActiveKey='1'>
          <Panel header={sensorData.localName + ' pressure'} eventKey='1'>
            <AreaChart
              data={statsData}
              width={this.state.chartWidth}
              height={300}
              yAxisTickCount={4}
              xAxisTickInterval={{unit: 'hour', interval: interval}}
              title='Pressure Chart'
            />
          </Panel>
        </PanelGroup>
      </div>
    );
  }
});

module.exports = Home;

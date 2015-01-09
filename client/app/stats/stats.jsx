var React = require('react'),
  Reflux = require('reflux');

var ReactBootstrap = require('react-bootstrap'),
  Panel = ReactBootstrap.Panel,
  PanelGroup = ReactBootstrap.PanelGroup,
  Button = ReactBootstrap.Button,
  rd3 = require('react-d3'),
  AreaChart = rd3.AreaChart,
  store = require('../store'),
  actions = require('../actions'),
  _ = require('lodash');

var Home = React.createClass({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    sensor: React.PropTypes.object,
    temperatureStats: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      sensor: {},
      temperatureStats: []
    };
  },

  componentDidMount: function () {
    var self = this;

    var sensor = store.getSensor();

    function loadTemp () {
      store.getTemperatureStats(function (err, temperatureStats) {
        self.setState({
          sensor: sensor,
          temperatureStats: temperatureStats
        });
      });
    }

    if (!sensor) {
      this.listenTo(actions.server.loadedSensor, function () {
        sensor = store.getSensor();
        loadTemp();
      });
    } else {
      loadTemp();
    }

    this.listenTo(store.actions.temperatureStatsChanged, function (temperatureStats) {

      self.setState({
        sensor: sensor,
        temperatureStats: temperatureStats
      });
    });
  },

  render: function () {
    var sensorData = this.state.sensor ? this.state.sensor : { sensorValues: {} };
    var temperatureData = this.state.temperatureStats ? this.state.temperatureStats : [];

    return (
      <div>
        <PanelGroup defaultActiveKey='1'>
          <Panel header={sensorData.localName + ' (' + sensorData.uuid + ') temperature'} eventKey='1'>
            <AreaChart
              data={temperatureData}
              width={400}
              height={300}
              yAxisTickCount={4}
              xAxisTickInterval={{unit: 'minute', interval: 5}}
              title='Temperature Chart'
            />
          </Panel>
        </PanelGroup>
      </div>
    );
  }
});

module.exports = Home;

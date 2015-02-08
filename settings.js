var pkg = require('./package.json'),
    path = require('path');

var settings = {
  name: pkg.name,
  version: pkg.version,
  statics: {
    '/': path.join(__dirname, 'client/dist')
  },
  debug: (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false
};

settings.logging = {
  level: settings.debug ? 'debug' : 'info',
  timestamp: false,
  enableWebLog: false
};

// webpack-dev-server
// settings.hot = {
//   port: 2992
// };

settings.sessionKey = settings.name + '.sid';
settings.sessionSecret = 'very_secret';

settings.repository = {
  type: 'tingodb',
  dbPath: __dirname
};

settings.port = 1987;

settings.enableSensorSimulation = true;


if (process.env.DEPLOY_TYPE === 'edison' || process.argv.length === 3 && process.argv[2] === 'edison') {
  settings.enableSensorSimulation = false;

  (function killBluetoothd () {
    console.log('Unblocking BLE...');
    require('async').series([
      function (callback) {
        require('child_process').exec("rfkill unblock bluetooth", function (error, stdout, stderr) {
          console.log(arguments);
          callback(error);
        });
      },
      function (callback) {
        require('child_process').exec("killall bluetoothd", function (error, stdout, stderr) {
          console.log(arguments);
          callback(error);
        });
      },
      function (callback) {
        require('child_process').exec("hciconfig hci0 up", function (error, stdout, stderr) {
          console.log(arguments);
          callback(error);
        });
      }
    ], function () {
      console.log('Finished unblocking BLE...');
    });
  })();
}



// process.env.DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'local';

// if (process.env.DEPLOY_TYPE && fs.existsSync(path.join(__dirname, 'settings/' + process.env.DEPLOY_TYPE + '.js'))) {
//   module.exports = require('./settings/' + process.env.DEPLOY_TYPE + '.js')(settings);
// } else {
  module.exports = settings;
// }

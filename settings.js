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

// process.env.DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'local';

// if (process.env.DEPLOY_TYPE && fs.existsSync(path.join(__dirname, 'settings/' + process.env.DEPLOY_TYPE + '.js'))) {
//   module.exports = require('./settings/' + process.env.DEPLOY_TYPE + '.js')(settings);
// } else {
  module.exports = settings;
// }

'use strict';

var logging = require('../logger'),
  SensorTag = require('sensortag'),
  EventEmitter = require('events').EventEmitter,
  notifier = new EventEmitter(),
  createEvent = require('./createEvent');

var logger;

var maxRssiCheckInMs = 2 * 60 * 1000;
var humidityCheckIntervalInMs = 1 * 60 * 1000;
var barometricPressureCheckIntervalInMs = 10 * 60 * 1000;

var sensorTag, rssiTimeout, rssiCheckInMs, humidityCheckInterval, barometricPressureCheckInterval;

function checkRssi () {
  sensorTag.oldRssi = sensorTag.oldRssi || 0;

  rssiTimeout = setTimeout(function () {
    sensorTag._peripheral.updateRssi(function (err, rssi) {
      if (err) {
        return logger.error(err);
      }

      if (rssi === 127) {
        logger.warn('sensortag seams to be disconnected');
        return;
      }

      if (Math.abs(rssi - sensorTag.oldRssi) <= 8) {
        if (rssiCheckInMs < maxRssiCheckInMs) {
          rssiCheckInMs += 1000;
          logger.debug('sensortag seams stable, slow down rssi interval (' + rssiCheckInMs + 'ms)');
        }
      } else {
        rssiCheckInMs = 1000;
        logger.debug('sensortag seams moving, faster up rssi interval (' + rssiCheckInMs + 'ms)');
      }

      var same = rssi === sensorTag.oldRssi;

      sensorTag.oldRssi = rssi;

      if (!same) {
        notifier.emit('event', createEvent('rssiUpdated', rssi, sensorTag.uuid));
      }

      checkRssi();
    });
  }, rssiCheckInMs);
}

function temperature () {
  logger.info('disable IrTemperature');
  sensorTag.disableIrTemperature(function (err) {
    if (err) {
      logger.error('failed to disable IrTemperature', err);
      return;
    }
    logger.info('IrTemperature disable');
  });
}

function accelerometer () {
  logger.info('disable Accelerometer');
  sensorTag.disableAccelerometer(function (err) {
    if (err) {
      logger.error('failed to disable Accelerometer', err);
      return;
    }
    logger.info('Accelerometer disabled');
  });
}

function humidity () {
  logger.info('subscribe for Humidity changes');

  function check (temperature, humidity) {
    if (temperature !== sensorTag.sensorValues.ambientTemperature) {
      sensorTag.sensorValues.ambientTemperature = temperature;
      notifier.emit('event', createEvent('temperatureChanged', temperature, sensorTag.uuid));
    }
    if (humidity !== sensorTag.sensorValues.humidity) {
      sensorTag.sensorValues.humidity = humidity;
      notifier.emit('event', createEvent('humidityChanged', humidity, sensorTag.uuid));
    }
  }

  // sensorTag.on('humidityChange', check);

  // sensorTag.notifyHumidity(function (err) {
  //   if (err) {
  //     logger.error('failed to subscribe for Humidity changes', err);
  //     return;
  //   }
  //   logger.info('Humidity changes subscribed');
  // });

  logger.info('enable Humidity');
  sensorTag.enableHumidity(function (err) {
    if (err) {
      logger.error('failed to enable Humidity', err);
      return;
    }
    logger.info('Humidity enabled');

    humidityCheckInterval = setInterval(function () {
      sensorTag.readHumidity(check);
    }, humidityCheckIntervalInMs);
    sensorTag.readHumidity(check);

  });
}

function magnetometer () {
  logger.info('disable Magnetometer');
  sensorTag.disableMagnetometer(function (err) {
    if (err) {
      logger.error('failed to disable Magnetometer', err);
      return;
    }
    logger.info('Magnetometer disabled');
  });
}

function barometricPressure () {
  logger.info('subscribe for BarometricPressure changes');

  function check (pressure) {
    if (pressure !== sensorTag.sensorValues.barometricPressure) {
      sensorTag.sensorValues.barometricPressure = pressure;
      notifier.emit('event', createEvent('barometricPressureChanged', pressure, sensorTag.uuid));
    }
  }

  // sensorTag.on('barometricPressureChange', check);

  // sensorTag.notifyBarometricPressure(function (err) {
  //   if (err) {
  //     logger.error('failed to subscribe for BarometricPressure changes', err);
  //     return;
  //   }
  //   logger.info('BarometricPressure changes subscribed');
  // });

  logger.info('enable BarometricPressure');
  sensorTag.enableBarometricPressure(function (err) {
    if (err) {
      logger.error('failed to enable BarometricPressure', err);
      return;
    }
    logger.info('BarometricPressure enabled');

    barometricPressureCheckInterval = setInterval(function () {
      sensorTag.readBarometricPressure(check);
    }, barometricPressureCheckIntervalInMs);
    sensorTag.readBarometricPressure(check);
  });
}

function gyroscope () {
  logger.info('disable Gyroscope');
  sensorTag.disableGyroscope(function (err) {
    if (err) {
      logger.error('failed to disable Gyroscope', err);
      return;
    }
    logger.info('Gyroscope disabled');
  });
}

function simpleKey () {
  logger.info('subscribe for SimpleKey changes');

  sensorTag.on('simpleKeyChange', function (left, right) {
    if (left !== sensorTag.sensorValues.leftKey) {
      sensorValues.leftKey = left;
      if (left === true) {
        notifier.emit('event', createEvent('leftKeyPressed', null, sensorTag.uuid));
      }
      if (left === false) {
        notifier.emit('event', createEvent('leftKeyReleased', null, sensorTag.uuid));
      }
    }

    if (right !== sensorTag.sensorValues.rightKey) {
      sensorValues.rightKey = right;
      if (right === true) {
        notifier.emit('event', createEvent('rightKeyPressed', null, sensorTag.uuid));
      }
      if (right === false) {
        notifier.emit('event', createEvent('rightKeyReleased', null, sensorTag.uuid));
      }
    }
  });

  sensorTag.notifySimpleKey(function (err) {
    if (err) {
      logger.error('failed to subscribe for SimpleKey changes', err);
      return;
    }
    logger.info('SimpleKey changes subscribed');
  });
}

function listenForEvents () {
  temperature();
  accelerometer();
  humidity();
  magnetometer();
  barometricPressure();
  gyroscope();
  //simpleKey();
}

function getTagInfos () {
  sensorTag.discoverServicesAndCharacteristics(function (err) {
    if (err) {
      return logger.error(err);
    }

    sensorTag.readSystemId(function(systemId) {
      sensorTag.systemId = systemId;

      sensorTag.readFirmwareRevision(function(firmwareRevision) {
        sensorTag.firmwareRevision = firmwareRevision.replace(/\0/g, '');

        sensorTag.readManufacturerName(function(manufacturerName) {
          sensorTag.manufacturerName = manufacturerName.replace(/\0/g, '');

          var sensor = {
            uuid: sensorTag.uuid,
            localName: sensorTag._peripheral.advertisement.localName,
            rssi: sensorTag._peripheral.rssi,
            systemId: sensorTag.systemId,
            firmwareRevision: sensorTag.firmwareRevision,
            manufacturerName: sensorTag.manufacturerName
          };

          notifier.emit('event', createEvent('connected', sensor, sensorTag.uuid));

          checkRssi();

          listenForEvents();
        });
      });
    });
  });
}

function connect () {
  sensorTag.sensorValues = {};
  sensorTag.connect(function (err) {
    if (err) {
      return logger.error(err);
    }

    getTagInfos();
  });
}

function found (st) {
  sensorTag = st;

  rssiCheckInMs = 1000;

  var sensor = {
    uuid: sensorTag.uuid,
    localName: sensorTag._peripheral.advertisement.localName,
    rssi: sensorTag._peripheral.rssi
  };

  notifier.emit('event', createEvent('discovered', sensor, sensorTag.uuid));
}

function handleDisconnection () {
  sensorTag.on('disconnect', function() {
    if (rssiTimeout) {
      clearTimeout(rssiTimeout);
    }

    if (humidityCheckInterval) {
      clearInterval(humidityCheckInterval);
    }

    if (barometricPressureCheckInterval) {
      clearInterval(barometricPressureCheckInterval);
    }

    var sensor = {
      uuid: sensorTag.uuid,
      localName: sensorTag._peripheral.advertisement.localName,
      rssi: sensorTag._peripheral.rssi,
      systemId: sensorTag.systemId,
      firmwareRevision: sensorTag.firmwareRevision,
      manufacturerName: sensorTag.manufacturerName
    };
    notifier.emit('event', createEvent('disconnected', sensor, sensorTag.uuid));

    sensorTag.removeAllListeners();
    sensorTag = null;

    logger.warn('got a disconnect from the sensorTag...');
    // SensorTag.discover(found);

    // TODO: just for now...
    logger.warn('Killing myself, since sensortag library is buggy...');
    /*eslint no-process-exit:0*/
    setTimeout(function () {
     process.exit(1);
    }, 1000);
  });
}

function foundAndConnect (st) {
  sensorTag = st;

  rssiCheckInMs = 1000;

  var sensor = {
    uuid: sensorTag.uuid,
    localName: sensorTag._peripheral.advertisement.localName,
    rssi: sensorTag._peripheral.rssi
  };

  notifier.emit('event', createEvent('discovered', sensor, sensorTag.uuid));

  handleDisconnection();

  connect();
}


// commands

notifier.on('command', function (cmd) {
  if (!sensorTag) {
    notifier.emit('event', createEvent('commandRejected', {
      reason: 'no sensorTag discovered',
      command: cmd
    }, cmd.sensorTagId, cmd.id));
    return;
  }

  if (cmd.name === 'connect') {
    if (sensorTag._peripheral.state === 'connected') {
      notifier.emit('event', createEvent('commandRejected', {
        reason: 'already connected',
        command: cmd
      }, cmd.sensorTagId, cmd.id));
      return;
    }

    connect();
    return;
  }

  if (cmd.name === 'disconnect') {
    if (sensorTag._peripheral.state === 'disconnected') {
      notifier.emit('event', createEvent('commandRejected', {
        reason: 'already disconnected',
        command: cmd
      }, cmd.sensorTagId, cmd.id));
      return;
    }

    sensorTag.disconnect();
    return;
  }
});


module.exports = function () {
  logger = logging.getLogger('sensortag:real');

  SensorTag.discover(foundAndConnect);

  return notifier;
};

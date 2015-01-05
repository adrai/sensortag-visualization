'use strict';

var logging = require('../logger'),
  SensorTag = require('sensortag'),
  EventEmitter = require('events').EventEmitter,
  notifier = new EventEmitter(),
  createEvent = require('./createEvent');

var logger;

var sensorTag, rssiTimeout, rssiCheckInMs;

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
        if (rssiCheckInMs < 30000) {
          rssiCheckInMs += 1000;
          logger.debug('sensortag seams stable, slow down rssi interval (' + rssiCheckInMs + 'ms)');
        }
      } else {
        rssiCheckInMs = 1000;
        logger.debug('sensortag seams moving, faster up rssi interval (' + rssiCheckInMs + 'ms)');
      }

      sensorTag.oldRssi = rssi;

      notifier.emit('event', createEvent('rssiUpdated', rssi, sensorTag.uuid));

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

  sensorTag.on('humidityChange', function (temperature, humidity) {
    notifier.emit('event', createEvent('temperatureChanged', temperature, sensorTag.uuid));
    notifier.emit('event', createEvent('humidityChanged', humidity, sensorTag.uuid));
  });

  sensorTag.notifyHumidity(function (err) {
    if (err) {
      logger.error('failed to subscribe for Humidity changes', err);
      return;
    }
    logger.info('Humidity changes subscribed');
  });

  logger.info('enable Humidity');
  sensorTag.enableHumidity(function (err) {
    if (err) {
      logger.error('failed to enable Humidity', err);
      return;
    }
    logger.info('Humidity enabled');
  });
}

function listenForEvents () {
  temperature();
  accelerometer();
  humidity();
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
    SensorTag.discover(found);

    // TODO: just for now...
    //logger.warn('Killing myself, since sensortag library is buggy...');
    ///*eslint no-process-exit:0*/
    //setTimeout(function () {
    //  process.exit(1);
    //}, 1000);
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

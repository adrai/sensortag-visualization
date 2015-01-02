'use strict';

var SensorTag = require('sensortag'),
  logging = require('./logger'),
  EventEmitter = require('events').EventEmitter,
  uuid = require('node-uuid').v4,
  notifier = new EventEmitter();

var logger;

var inited = false;

var rssiTimeout, rssiCheckInMs;

/**
 * Returns a random number between passed values of min and max.
 * @param {Number} min The minimum value of the resulting random number.
 * @param {Number} max The maximum value of the resulting random number.
 * @returns {Number}
 */
function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function createEvent (name, payload, tagId) {
  return { id: uuid().toString(), name: name, payload: payload, sensorTagId: tagId };
}

function handleDisconnection (sensorTag) {
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
    notifier.emit('event', createEvent('disconnect', sensor, sensorTag.uuid));

    logger.warn('got a disconnect from the sensorTag...');
    // SensorTag.discover(found);
    
    // TODO: just for now...
    logger.warn('Killing myself, since sensortag library is buggy...');
    /*eslint no-process-exit:0*/
    process.exit(1);
  });
}

function checkRssi (sensorTag) {
  sensorTag.oldRssi = sensorTag.oldRssi || 0;

  rssiTimeout = setTimeout(function () {
    sensorTag._peripheral.updateRssi(function (err, rssi) {
      if (err) {
        return logger.error(err);
      }

      if (Math.abs(rssi - sensorTag.oldRssi) <= 8) {
        if (rssiCheckInMs < 20000) {
          rssiCheckInMs += 1000;
          logger.debug('sensortag seams stable, slow down rssi interval (' + rssiCheckInMs + 'ms)');
        }
      } else {
        rssiCheckInMs = 1000;
        logger.debug('sensortag seams moving, faster up rssi interval (' + rssiCheckInMs + 'ms)');
      }

      sensorTag.oldRssi = rssi;

      notifier.emit('event', createEvent('rssiUpdate', rssi, sensorTag.uuid));

      checkRssi(sensorTag);
    });
  }, rssiCheckInMs);
}

function getTagInfos (sensorTag) {
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
        
          notifier.emit('event', createEvent('connect', sensor, sensorTag.uuid));
          
          checkRssi(sensorTag);
        });
      });
    });
  });
}

function found (sensorTag) {
  rssiCheckInMs = 1000;

  handleDisconnection(sensorTag);

  sensorTag.connect(function (err) {
    if (err) {
      return logger.error(err);
    }

    getTagInfos(sensorTag);
  });
}

function simulate () {
  setTimeout(function () {
    notifier.emit('event', createEvent('connect', {
      uuid: '713724cf9f8f4b23827c623c7ddbe0fb',
      localName: 'SensorTag (Simulator)',
      rssi: randomBetween(-99, -20),
      systemId: '68:a5:4:0:0:19:19:f2',
      firmwareRevision: '1.5 (Oct 23 2013)',
      manufacturerName: 'Texas Instruments'
    }, '713724cf9f8f4b23827c623c7ddbe0fb'));
  }, 1000);
  var inter = setInterval(function () {
    notifier.emit('event', createEvent('rssiUpdate', randomBetween(-99, -20), '713724cf9f8f4b23827c623c7ddbe0fb'));
  }, 3000);
  setTimeout(function () {
    notifier.emit('event', createEvent('disconnect', {
      uuid: '713724cf9f8f4b23827c623c7ddbe0fb',
      localName: 'SensorTag (Simulator)',
      rssi: randomBetween(-99, -20),
      systemId: '68:a5:4:0:0:19:19:f2',
      firmwareRevision: '1.5 (Oct 23 2013)',
      manufacturerName: 'Texas Instruments'
    }, '713724cf9f8f4b23827c623c7ddbe0fb'));
    clearTimeout(inter);
  }, 20000);
}

module.exports = function (simulateSensor) {
  if (!inited) {
    logger = logging.getLogger('sensortag');

    if (simulateSensor) {
      simulate();
    } else {
      SensorTag.discover(found);
    }
    
    inited = true;
  }

  return notifier;
};
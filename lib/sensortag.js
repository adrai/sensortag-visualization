'use strict';

var SensorTag = require('sensortag'),
  logging = require('./logger'),
  EventEmitter = require('events').EventEmitter,
  uuid = require('node-uuid').v4,
  notifier = new EventEmitter();

var logger;

var rssiInterval;

function createEvent (name, payload, tagId) {
  return { eventId: uuid().toString(), name: name, payload: payload, sensorTagId: tagId };
}

function handleDisconnection (sensorTag) {
  sensorTag.on('disconnect', function() {
    if (rssiInterval) {
      clearInterval(rssiInterval);
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
  rssiInterval = setInterval(function () {
    sensorTag._peripheral.updateRssi(function (err, rssi) {
      if (err) {
        return logger.error(err);
      }

      notifier.emit('event', createEvent('rssiUpdate', rssi, sensorTag.uuid));
    });
  }, 1000);
}

function getTagInfos (sensorTag) {
  sensorTag.discoverServicesAndCharacteristics(function (err) {
    if (err) {
      return logger.error(err);
    }

    sensorTag.readSystemId(function(systemId) {
      sensorTag.systemId = systemId;

      sensorTag.readFirmwareRevision(function(firmwareRevision) {
        sensorTag.firmwareRevision = firmwareRevision;

        sensorTag.readManufacturerName(function(manufacturerName) {
          sensorTag.manufacturerName = manufacturerName;

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
  handleDisconnection(sensorTag);

  sensorTag.connect(function (err) {
    if (err) {
      return logger.error(err);
    }

    getTagInfos(sensorTag);
  });
}

var inited = false;

module.exports = function () {
  if (!inited) {
    logger = logging.getLogger('sensortag');

    SensorTag.discover(found);
    
    inited = true;
  }

  return notifier;
};
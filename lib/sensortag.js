'use strict';

var SensorTag = require('sensortag'),
  logging = require('./logger'),
  EventEmitter = require('events').EventEmitter,
  uuid = require('node-uuid').v4,
  notifier = new EventEmitter();

var logger;

var inited = false;

var sensorTag, rssiTimeout, rssiCheckInMs;

/**
 * Returns a random number between passed values of min and max.
 * @param {Number} min The minimum value of the resulting random number.
 * @param {Number} max The maximum value of the resulting random number.
 * @returns {Number}
 */
function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function createEvent (name, payload, tagId, correlationId) {
  return { id: uuid().toString(), name: name, payload: payload, sensorTagId: tagId, correlationId: correlationId };
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
        if (rssiCheckInMs < 20000) {
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

// commands

notifier.on('command', function (cmd) {
  if (isSimulating) {
    if (cmd.name === 'connect') {
      simulateConnect();
      return;
    }

    if (cmd.name === 'disconnect') {
      simulateDisconnect();
      return;
    }

    return;
  }

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


// simulation

var isSimulating = false;
var simulateRssiUpdatedInterval = null;
var simulationSensorTagUuid = '713724cf9f8f4b23827c623c7ddbe0fb';

function simulateDiscovered() {
  notifier.emit('event', createEvent('discovered', {
    uuid: simulationSensorTagUuid,
    localName: 'SensorTag (Simulator)',
    rssi: randomBetween(-99, -20)
  }, simulationSensorTagUuid));
}

function simulateDisconnect() {
  notifier.emit('event', createEvent('disconnected', {
    uuid: simulationSensorTagUuid,
    localName: 'SensorTag (Simulator)',
    rssi: randomBetween(-99, -20),
    systemId: '68:a5:4:0:0:19:19:f2',
    firmwareRevision: '1.5 (Oct 23 2013)',
    manufacturerName: 'Texas Instruments'
  }, simulationSensorTagUuid));

  if (simulateRssiUpdatedInterval) {
    clearTimeout(simulateRssiUpdatedInterval);
  }
  
  setTimeout(function () {
    simulateDiscovered();
  }, 2000);
}

function simulateConnect() {
  notifier.emit('event', createEvent('connected', {
    uuid: simulationSensorTagUuid,
    localName: 'SensorTag (Simulator)',
    rssi: randomBetween(-99, -20),
    systemId: '68:a5:4:0:0:19:19:f2',
    firmwareRevision: '1.5 (Oct 23 2013)',
    manufacturerName: 'Texas Instruments'
  }, simulationSensorTagUuid));

  simulateRssiUpdatedInterval = setInterval(function () {
    notifier.emit('event', createEvent('rssiUpdated', randomBetween(-99, -20), simulationSensorTagUuid));
  }, 3000);
}

function simulate () {
  setTimeout(function () {
    simulateDiscovered();
  }, 1000);

  setTimeout(function () {
    simulateConnect();
  }, 3000);
}




module.exports = function (enableSimulation) {
  if (!inited) {
    logger = logging.getLogger('sensortag');

    if (enableSimulation) {
      isSimulating = enableSimulation;
      simulate();
    } else {
      SensorTag.discover(foundAndConnect);
    }
    
    inited = true;
  }

  return notifier;
};
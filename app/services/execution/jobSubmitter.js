var Bluebird = require('bluebird');

var RabbitMQ = require('../../rabbitmq'),
  mongoClient = require('../../dataAccess/mongo'),
  logger = require('../../logger'),
  rabbitMQConfig = require('config').get('rabbitmq'),
  socketHandler = require('../../socket'),
  JobUpdator = require('./jobUpdator'),
  constants = require('../../common/constants');

var LOG_STATUS = 'logStatus';

var JobSubmitter = function() {};

JobSubmitter.prototype.submit = function (jobObject) {
  var saveFlag = 0;
  var objectId = mongoClient.getObjectId();
  jobObject.jobId = objectId.toString();
  jobObject.time = new Date();
  return _saveJobObject(jobObject)
    .then(function () {
      logger.info(jobObject.appId, 'publishing job to rabbitmq...', jobObject);
      saveFlag = 1;
      var rabbitmq = _getRequiredRabbitMQInstance(jobObject);
      rabbitmq.publish(JSON.stringify(jobObject));
      establishSocketConnection(jobObject);
    })
    .then(function () {
      logger.info(jobObject.appId, 'publishing job to rabbitmq...');
      return jobObject;
    })
    .catch(function (err) {
      if (saveFlag === 1) {
        mongoClient.deleteOne(constants.dbConstants.databases.fluentD, LOG_STATUS, {
          _id: objectId
        });
      }
      throw err;
    });
};

var establishSocketConnection = function (jobObject) {
  socketHandler.joinRoom(jobObject.jobId);
  socketHandler.addEventHandler('updateExecutionStatus', _updateJobStatus);
}

var _saveJobObject = function (jobData) {
  jobData._id = mongoClient.getObjectId(jobData.jobId);
  jobData.status = 'Queued';
  return mongoClient.save(constants.dbConstants.databases.fluentD, LOG_STATUS, jobData);
};

var _updateJobStatus = function (jobData) {
  logger.info(jobData.appId, 'updating job status..', jobData);
  jobData._id = mongoClient.getObjectId(jobData.jobId);

  if (jobData.status.startsWith('Execution')) {
    return new JobUpdator().updateExecution(jobData)
      .then(function () {
        if (jobData.status === 'Execution Completed') {
          return Bluebird.all([
            new JobUpdator().runTableauExtract(jobData, jobData.token),
            new JobUpdator().runPowerbiImports(jobData, jobData.token),
          ]);
        }
      })
      .then(function () {
        logger.info(jobData.appId, 'Remove lock for the execution', jobData.jobId);
        return new JobUpdator().removeLock(jobData);
      })
      .finally(function () {
        socketHandler.leaveRoom(jobData.jobId);
      });
  } else {
    return mongoClient.save(constants.dbConstants.databases.fluentD, LOG_STATUS, jobData);
  }
}

var _getRequiredRabbitMQInstance = function (jobObject) {
  var _queue = 'default';
  if (rabbitMQConfig.independentQueue) {
    var queues = Object.keys(rabbitMQConfig.queues);
    queues.forEach(function (queue) {
      if (rabbitMQConfig.queues[queue].executionTypes && rabbitMQConfig.queues[queue].executionTypes.indexOf(jobObject.type) >= 0) {
        _queue = queue;
      }
    });
  }
  logger.info(jobObject.appId, 'queue name', _queue);
  return new RabbitMQ(rabbitMQConfig, _queue);
}

module.exports = new JobSubmitter();

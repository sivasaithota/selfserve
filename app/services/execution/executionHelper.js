var util = require('util'),
  Bluebird = require('bluebird');

var logger = require('../../logger'),
  jobprocessorConfig = require('config').get('jobprocessor'),
  constants = require('../../common/constants'),
  mongoClient = require('../../dataAccess/mongo'),
  lockingService = require('../locking').getInstance(),
  Axios = require('../../common/axios');

var ExecutionHelper = function () {

  var removeBusinessLogString = function (logs) {
    for (var iLog = 0; iLog < logs.length; iLog++) {
      logs[iLog].log = logs[iLog].log.replace('#businesslog', '');
    }
    return logs;
  };

  var stopExecution = function (jobData, username, token, appId) {
    if (jobData) {
      logger.info(appId, 'Stopping Execution for job', jobData);
      var promises = [];
      jobData.status = 'Execution Cancelled';
      var options = {
        method: 'post',
        url: util.format(jobprocessorConfig.hostname + '%s/%s', jobprocessorConfig.path, 'executions/stop'),
        data: jobData,
        headers: {
          'authorization': token
        },
      };
      logger.info(appId, 'Stopping Execution', jobData);
      promises.push(new Axios().makeRequest(options));
      promises.push(lockingService.removeLock({
        username: username,
        scenarioId: jobData.scenarioId
      }, appId));
      promises.push(mongoClient.save(constants.dbConstants.databases.fluentD, 'logStatus', jobData));
      return Bluebird.all(promises)
        .then(function () {
          return jobData;
        });
    } else {
      throw {
        code: constants.httpCodes.internalServerError,
        message: constants.execution.jobDataNotFound
      };
    }
  };

  return {
    removeBusinessLogString: removeBusinessLogString,
    stopExecution: stopExecution,
  };
};

module.exports = ExecutionHelper;

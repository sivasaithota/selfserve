var Bluebird = require('bluebird'),
  lockingService = require('../locking').getInstance(),
  tableauService = require('../tableau').getInstance(),
  powerbiService = require('../powerbi'),
  logger = require('../../logger'),
  util = require('util'),
  queryHelper = require('./queryHelper'),
  dataAccess = require('../../dataAccess/postgres'),
  enframeManager = require('../enframeManager'),
  mongoClient = require('../../dataAccess/mongo'),
  constants = require('../../common/constants');

var JobUpdator = function () {

  var updateExecution = function (jobData) {
    var promise = [];
    logger.info(jobData.appId, 'Updating execution', jobData);
    promise.push(enframeManager.updateLastAccessTime(jobData.appId, jobData.actionId, jobData.username, jobData.token));
    if (jobData.type === 'secondary' && jobData.triggerType === 'tableEdit') {
      promise.push(updateTriggerStatus(jobData.scenarioId, jobData.username, {
        tableName: jobData.table,
        status: jobData.status === 'Execution Completed' ? 'Uploaded successfully' : 'Data validation failed'
      }, jobData.appId));
    } else if (jobData.status === 'Execution Completed' && jobData.type === 'secondary' && jobData.segment === 'input') {
      promise.push(updateSecondaryActionStatus(jobData.scenarioId, jobData.username, {
        actionDesc: jobData.action_desc,
        segment: jobData.segment
      }, jobData.appId));
    } else if (jobData.status === 'Execution Completed' && (jobData.type === 'primary' || (jobData.type === 'secondary' && jobData.segment === 'output'))) {
      promise.push(updateExecutionStatus(jobData.scenarioId, jobData.username, jobData.appId));
    }
    return Bluebird.all(promise)
      .catch(function (error) {
        jobData.status = 'Execution Failed';
        return mongoClient.save(constants.dbConstants.databases.fluentD, 'logs', {
          container_name: '/' + jobData.jobId,
          "log": '#businesslog' + error.message,
          "time": new Date()
        });
      })
      .finally(function () {
        return mongoClient.save(constants.dbConstants.databases.fluentD, 'logStatus', jobData);
      });
  };

  var updateExecutionStatus = function (scenarioId, username, appId) {
    logger.info(appId, 'Updating execution for the scenario!!', scenarioId);
    return dataAccess.executeQuery(appId, util.format(
      queryHelper.updateExecution,
      scenarioId,
      username
    ));
  };

  var updateTriggerStatus = function (scenarioId, username, queryParams, appId) {
    logger.info(appId, 'Update table edit trigger status');
    var query = util.format(queryHelper.updateTable, queryParams.status, scenarioId, queryParams.tableName)

    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        return result.rows[0];
      })
      .catch(function (err) {
        logger.error(appId, 'Error executing query!', err);
        throw new Error(err);
      });
  };

  var updateSecondaryActionStatus = function (scenarioId, username, queryParams, appId) {
    logger.info(appId, 'Executing secondary action status');
    var query = util.format(queryHelper.updateProject, scenarioId, queryParams.actionDesc, username, queryParams.segment)
    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        return result.rows[0];
      })
      .catch(function (err) {
        logger.error(appId, 'Error updating secondary action status!', err);
        throw new Error(err);
      });
  };

  var removeLock = function (jobData) {
    var lockingObject = {
      scenarioId: jobData.scenarioId,
      username: jobData.username
    };
    logger.info(jobData.appId, 'lock removed');
    return lockingService.removeLock(lockingObject, jobData.appId);
  };

  var runTableauExtract = function (jobData) {
    var extractObject = {
      username: jobData.username,
      typeId: jobData.actionId,
      jobId: jobData.jobId,
      scenarioId: jobData.scenarioId,
      token: jobData.token,
    };
    logger.info(jobData.appId, 'run tableau extract');
    return tableauService.runExtract(extractObject, jobData.appId);
  };

  var runPowerbiImports = function (jobData) {
    var importObject = {
      username: jobData.username,
      typeId: jobData.actionId,
      jobId: jobData.jobId,
      scenarioId: jobData.scenarioId,
      token: jobData.token,
    };
    logger.info(jobData.appId, 'send refresh request for powerbi imports', jobData.jobId);
    return powerbiService().refreshImports(importObject, jobData.appId);
  }

  return {
    updateExecution: updateExecution,
    removeLock: removeLock,
    runTableauExtract: runTableauExtract,
    runPowerbiImports: runPowerbiImports,
  };

}
module.exports = JobUpdator;

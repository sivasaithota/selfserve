var util = require('util'),
  Bluebird = require('bluebird'),
  path = require('path');

var mongoClient = require('../../dataAccess/mongo'),
  DataManager = require('./dataManager'),
  jobSubmitter = require('./jobSubmitter'),
  logger = require('../../logger'),
  ExecutionHelper = require('./executionHelper'),
  constants = require('../../common/constants'),
  Filer = require('../../common/filer'),
  enframeManager = require('../enframeManager'),
  CommonServices = require('../commonServices');

var _instance;
var commonServices = new CommonServices();

var logStatusCollection = 'logStatus',
  logsCollection = 'logs';

var Execution = function () {};

/********
Function to execute the script. query params contains the scenariod
********/

Execution.prototype.execute = function (queryParams, token) {
  logger.info(queryParams.appId, 'Executing Script for the Scenario:', queryParams.scenarioId);
  var dataManager = new DataManager();
  return dataManager.getExecutionData(queryParams, token)
    .then(function (executionObject) {
      executionObject.scenarioId = queryParams.scenarioId;
      executionObject.username = queryParams.username;
      executionObject.accessToken = queryParams.accessToken;
      executionObject.refreshToken = queryParams.refreshToken;
      executionObject.token = token;
      logger.info(queryParams.appId, 'Execution object for job submission:', executionObject);
      return jobSubmitter.submit(executionObject);
    })
    .catch(function (err) {
      logger.error(queryParams.appId, 'Error while submitting job to queue...', err);
      throw err;
    });
};

/********
Function to get the script execution history by using the scenario id
********/

Execution.prototype.executionHistory = function (scenarioId, queryParams, appId) {
  var options = {
    sort: [
      ['_id', 'desc']
    ]
  };
  var query = [{
      appId: appId
    },
    {
      scenarioId: scenarioId
    },
    {
      type: queryParams.type
    }
  ];
  if (queryParams.limit && !isNaN(queryParams.limit) && !queryParams.actionIds) {
    options.limit = parseInt(queryParams.limit);
  }
  if (queryParams.actionIds) {
    var scriptList = queryParams.actionIds.split(',');
    query.push({
      actionId: {
        $in: scriptList
      }
    });
  }
  logger.info(appId, 'Getting execution history', query);
  return mongoClient.find(constants.dbConstants.databases.fluentD, logStatusCollection, {
      $and: query
    }, {}, options.sort, options.limit)
    .then(function (result) {
      var filteredResults = [];
      if (result && result.length > 0 && queryParams.type !== 'secondary') {
        for (var irow = 0; irow < result.length; irow++) {
          delete result[irow].errorLog;
        }
      }
      if (result && result.length > 0 &&
        queryParams.type === 'secondary' && queryParams.actionIds) {
        for (var irow = 0; irow < result.length; irow++) {
          var matchedResult = filteredResults.find(function (value) {
            if (value.actionId === result[irow].actionId) {
              return value;
            }
          });
          if (!matchedResult) {
            filteredResults.push(result[irow])
          }
        }
      }

      return !queryParams.actionIds ? result : filteredResults;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while getting execution history', err);
      throw new Error(err);
    });
};

/********
Function to get the script execution history by using the scenario id and job id
********/

Execution.prototype.executionJobHistory = function (scenarioId, jobId, appId) {
  logger.info(appId, 'Getting execution Job history', scenarioId);
  return mongoClient.find(constants.dbConstants.databases.fluentD, logStatusCollection, {
    $and: [{
        appId: appId
      },
      {
        scenarioId: scenarioId
      },
      {
        jobId: jobId
      }
    ]
  });
};

/********
Function to get execution history logs by job id
********/

Execution.prototype.getExecutionLogs = function (jobId, queryParams, appId) {
  var jobData;
  logger.info(appId, 'Get Execution Logs for JobId:', jobId);
  return mongoClient.findOne(constants.dbConstants.databases.fluentD, logStatusCollection, {
      _id: mongoClient.getObjectId(jobId)
    }, {
      errorLog: 0
    })
    .then(function (result) {
      jobData = result;
      if (jobData) {
        var query = {
            $and: [{
              container_name: '/' + jobId
            }]
          },
          options = {};
        if (mongoClient.isValidObjectId(queryParams.lastLogId)) {
          query.$and.push({
            _id: {
              $gt: mongoClient.getObjectId(queryParams.lastLogId)
            }
          });
        }
        if (queryParams.logType && queryParams.logType === 'businesslog') {
          query.$and.push({
            log: /.*#businesslog.*/
          });
        }

        if (queryParams.limit && !isNaN(queryParams.limit)) {
          options.limit = queryParams.limit;
          options.sort = [
            ['_id', 'desc']
          ];
        } else {
          options.sort = [
            ['_id', 'asc'],
            ['time', 'asc']
          ];
        }
        logger.info(appId, 'Executing Mongo query for fetching logs:', query);
        return mongoClient.find(constants.dbConstants.databases.fluentD, logsCollection, query, {}, options.sort, options.limit);
      } else {
        throw {
          code: constants.httpCodes.notFound,
          message: constants.execution.jobDataNotFound
        };
      }
    })
    .then(function (logResult) {
      logger.info(appId, 'Successfully retrieved logs.');
      jobData.logs = queryParams.logType && queryParams.logType === 'businesslog' ? new ExecutionHelper().removeBusinessLogString(logResult) : logResult;
      return jobData;
    })
    .catch(function (err) {
      logger.error(appId, 'Error retrieving logs', err);
      throw err;
    });
};

/*****
stops execution by getting job data based on job id .
pid from jobdata is used to kill the job.
*****/

Execution.prototype.stopExecution = function (username, jobId, token, appId) {
  logger.info(appId, 'Stopping execution', jobId);
  return mongoClient.findOne(constants.dbConstants.databases.fluentD, logStatusCollection, {
      _id: mongoClient.getObjectId(jobId),
      status: {
        $in: ['Running', 'Started']
      }
    })
    .then(function (jobData) {
      return new ExecutionHelper().stopExecution(jobData, username, token, appId);
    })
    .catch(function (err) {
      logger.error(appId, 'Error while stopping execution!', err);
      throw err;
    });
};


/*****
stops execution by getting job data based on scenario and appid
*****/

Execution.prototype.stopExecutionByScenarioId = function (scenarioId, username, token, appId) {
  logger.info(appId, 'Stopping execution by scenario Id', scenarioId);
  return mongoClient.findOne(constants.dbConstants.databases.fluentD, logStatusCollection, {
      appId: appId,
      scenarioId: scenarioId,
      status: {
        $in: ['Running', 'Started']
      }
    })
    .then(function (jobData) {
      return jobData ? new ExecutionHelper().stopExecution(jobData, username, token) : '';
    });
};

/*****
deleting logs from logs and logStatus collection based on jobId
 *****/

Execution.prototype.deleteLogs = function (jobData, appId) {
  var promises = [];
  logger.info(appId, 'Deleting logs for the job id', jobData.jobId);
  promises.push(mongoClient.deleteMany(constants.dbConstants.databases.fluentD, logStatusCollection, {
    _id: mongoClient.getObjectId(jobData.jobId)
  }));
  promises.push(mongoClient.deleteMany(constants.dbConstants.databases.fluentD, logsCollection, {
    container_name: '/' + jobData.jobId
  }));
  return Bluebird.all(promises).then(function (result) {
    return;
  });
};

/*****
deleting all the scenario data for the app from the mongodb
firstly, stops the execution for the scenario, and then delete from logs and logStatus
*****/

Execution.prototype.deleteScenarioData = function (scenarioId, username, token, appId) {
  logger.info(appId, 'Deleting scenario data', scenarioId);
  return this.stopExecutionByScenarioId(scenarioId, username, token, appId)
    .then(function (jobData) {
      return this.deleteLogs(jobData, appId);
    }.bind(this))
    .catch(function (err) {
      logger.error(appId, 'Error while deleting scenario data:' + scenarioId, err);
    })
};

/*****
fetch download action details from execution table based on action id.
If scenario specific is true, scenario id will be considered from query params
else, will be downloaded from ds folder
*****/

Execution.prototype.downloadAction = function (actionId, queryParams, userObject, appId, token) {
  var scriptUploadDir = commonServices.getScriptUploadDir(appId);
  var filePath = path.resolve(__dirname, scriptUploadDir);
  logger.info(appId, 'Getting download action by id');
  return enframeManager.getAction(appId, actionId, token)
    .then(function (actionObject) {
      logger.info(appId, 'Generate path to the file depends on scenario specific value');
      if (actionObject.isScenarioSpecific) {
        if (!queryParams.scenarioId) {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.execution.scenarioIdNotFound
          };
        } else filePath += '/scenario_' + queryParams.scenarioId;
      }
      filePath += '/' + actionObject.downloadFile;
      logger.info(appId, 'Checking if file exist', filePath);
      if (new Filer().fileExistSync(filePath)) {
        enframeManager.updateLastAccessTime(appId, actionId, userObject.username, token);
        return filePath;
      } else {
        logger.error(appId, 'Error while checking if file exist', filePath);
        throw {
          code: constants.httpCodes.notFound,
          message: util.format(constants.execution.fileNotFound, actionObject.file_name)
        };
      }

    });
};

/*****
fetch upload action details from execution table based on action id.
If scenario specific is true, scenario id will be considered from query params
else, will be uploaded to ds folder
*****/

Execution.prototype.uploadAction = function (actionId, uploadObject, userObject, token, appId) {
  logger.info(appId, 'uploading action', actionId);
  var scriptUploadDir = commonServices.getScriptUploadDir(appId);
  var uploadPath = path.resolve(__dirname, scriptUploadDir);
  return enframeManager.getAction(appId, actionId, token)
    .then(function (actionObject) {
      if (actionObject.isScenarioSpecific) {
        if (!uploadObject.scenarioId) {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.execution.scenarioIdNotFound
          };
        } else {
          uploadPath += '/scenario_' + uploadObject.scenarioId;
          var filer = new Filer();
          if (!filer.fileExistSync(uploadPath)) {
            logger.info(appId, 'Upload directory doesnot exists. Creating');
            return filer.makeDirectory(uploadPath, 0o777);
          }
        }
      }
      return uploadPath;
    })
    .then(function () {
      return new Filer().copyFile(uploadObject.file.path, uploadPath + '/' + uploadObject.file.name);
    })
    .then(function () {
      new Filer().deleteFile(uploadObject.file.path);
      return enframeManager.updateLastAccessTime(appId, actionId, userObject.username, token);
    })
    .then(function (result) {
      if (result.lastAccessedAt) {
        logger.info(appId, 'Execution settings updated successfully');
        return result;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.execution.updateError
        };
      }
    })
    .catch(function (err) {
      new Filer().deleteFile(uploadObject.file.path);
      logger.error(appId, 'Error while uploading action.', err);
      throw err;
    });
};

Execution.prototype.runTrigger = function (triggerObject, token, appId) {
  var {
    triggerType,
    scenarioId,
    username,
    accessToken,
    refreshToken
  } = triggerObject;
  var self = this;
  logger.info(appId, 'running trigger for scenario creation', scenarioId);
  return enframeManager.getTriggers(appId, {}, token)
    .then(function (result) {
      return result.filter(function (trigger) {
        return trigger.type === triggerType
      });
    })
    .then(function (triggers) {
      if (triggers.length && triggers[0].isEnabled === true) {
        self.execute({
          appId: appId,
          scenarioId: String(scenarioId),
          username: username,
          actionId: triggers[0].action._id,
          accessToken: accessToken,
          refreshToken: refreshToken,
        }, token);
      }
    });
}

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Execution();
    }
    return _instance;
  }
};

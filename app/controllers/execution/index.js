var ControllerHelper = require('../../common/controllerHelper'),
  executionService = require('../../services/execution').getInstance(),
  logger = require('../../logger'),
  constants = require('../../common/constants'),
  lockingService = require('../../services/locking').getInstance(),
  enframeManager = require('../../services/enframeManager');

const {
  getConnectorAccessToken
} = require('../../services/connector');

var _instance;

var Execution = function () {};

/*****
controller to execute the script. query params contains the scenariod
We are doing explicit lock for script execution,macros and input validation
*****/

Execution.prototype.execute = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  lockingService.checkLocks({
      scenarioId: req.params.scenarioId,
      username: req.user.username,
      explicitLock: true
    }, req.appData.appId)
    .then(() => {
      return getConnectorAccessToken(req.headers.authorization)
    })
    .then(({
      accessToken,
      refreshToken
    }) => {
      var executionObject = {
        appId: req.appData.appId,
        appName: req.appData.name,
        scenarioId: req.params.scenarioId,
        username: req.user.username,
        actionId: req.params.actionId,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      return executionService.execute(executionObject, req.headers.authorization);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully submitted script.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while executing script!', err);
      lockingService.removeLock({
        scenarioId: req.params.scenarioId,
        username: req.user.username
      }, req.appData.appId);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to get the script execution history by using the scenario id
*****/

Execution.prototype.executionHistory = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Retrieving execution history...');
  executionService.executionHistory(req.params.scenarioId, req.query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved execution history.', {
        Result: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving execution history!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to get the script execution history by using the scenario id and job id
*****/

Execution.prototype.executionJobHistory = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  executionService.executionJobHistory(req.params.scenarioId, req.params.jobId, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully executed script.', {
        Result: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while executing script!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to get execution history logs by job id
*****/

Execution.prototype.getExecutionLogs = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  executionService.getExecutionLogs(req.params.jobId, req.query, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      controllerHelper.sendErrorResponse(err);
    });
};

Execution.prototype.stopExecution = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.verifyLock(req.params.scenarioId, req.user.username, req.appData.appId)
  .then(function(){
    return executionService.stopExecution(req.user.username, req.params.jobId, req.headers.authorization, req.appData.appId);
  })
  .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller for download action
*****/

Execution.prototype.downloadAction = function (req, res) {
  logger.info(req.appData.appId, 'Download action');
  var controllerHelper = new ControllerHelper(res);
  executionService.downloadAction(req.params.actionId, req.query, req.user, req.headers.authorization, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully downloading file from action');
      controllerHelper.download(result, true);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error downloading action!', err);
      controllerHelper.sendErrorResponse(err);
    });
};


/*****
controller for upload action
*****/

Execution.prototype.uploadAction = function (req, res) {
  logger.info(req.appData.appId, 'Upload action');
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
    scenarioId: req.params.scenarioId,
    username: req.user.username,
    explicitLock: true
  }, req.appData.appId)
  .then(function(){
    return executionService.uploadAction(req.params.actionId, req.body, req.user, req.headers.authorization, req.appData.appId);
  })
  .then(function (result) {
    logger.info(req.appData.appId, 'Successfully uploaded file from action');
    controllerHelper.sendResponse(constants.httpCodes.success, result);
  })
  .catch(function (err) {
    logger.error(req.appData.appId, 'Error uploading action!', err);
    controllerHelper.sendErrorResponse(err);
  })
  .finally(function() {
    lockingService.removeLock({
      scenarioId: req.params.scenarioId,
      username: req.user.username
    }, req.appData.appId);
  });
};

Execution.prototype.getActions = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Get actions', req.query);
  enframeManager.getActions(req.appData.appId, req.query, req.headers.authorization)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error fetching actions', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/**
 * get triggers
 */
Execution.prototype.getTriggers = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Get triggers', req.query);
  enframeManager.getTriggers(req.appData.appId, req.query, req.headers.authorization)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error fetching triggers', err);
      controllerHelper.sendErrorResponse(err);
    });
};



module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Execution();
    }
    return _instance;
  }
};

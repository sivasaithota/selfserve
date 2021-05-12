var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger'),
  lockingService = require('../../services/locking').getInstance();

var _instance;

var Locking = function () {};

/*****
controller to release the lock
*****/

Locking.prototype.releaseLock = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Releasing the lock.');
  lockingService.releaseLock(req.appData.appId)
    .then(function () {
      controllerHelper.sendResponse(constants.httpCodes.success, constants.scenarioLocking.releaseLockSuccess);
    })
    .catch(function (err) {
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Controller to turn on/off the locking 
*****/
Locking.prototype.toggleLock = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Lock Switch.');
  return lockingService.toggleLock(req.body.isActive, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, req.body.isActive ? constants.scenarioLocking.lockEnabled : constants.scenarioLocking.lockDisabled);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while toggling lock', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to lock scenario
*****/

Locking.prototype.lockScenario = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Locking Scenario', req.body);
  lockingService.lockScenario(req.user, req.body, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while locking scenario!!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
remove scenario lock based on scenario id and user
*****/

Locking.prototype.removeScenarioLock = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Removing Scenario lock', req.params.scenarioId);
  lockingService.removeScenarioLock(req.params.scenarioId, req.user, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while removing scenario lock!!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Locking();
    }
    return _instance;
  }
};

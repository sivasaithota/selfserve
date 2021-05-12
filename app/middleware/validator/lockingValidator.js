var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var LockingValidator = function () {};

LockingValidator.prototype.validateToggleLock = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    lockObject = req.body;
  if (Object.keys(lockObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenarioLocking.lockObjectNotFound
    });
  } else if (typeof (lockObject.isActive) !== 'boolean') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenarioLocking.lockObjectInvalid
    });
  } else next();
};

LockingValidator.prototype.validateLockScenario = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    lockObject = req.body;
  if (!lockObject || Object.keys(lockObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenarioLocking.lockObjectNotFound
    });
  } else if (!lockObject.scenarioId || isNaN(lockObject.scenarioId)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenarioLocking.scenarioIdNotFound
    });
  } else next();

};

module.exports = LockingValidator;

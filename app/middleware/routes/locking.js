var express = require('express'),
  lockingRouter = express.Router();

var lockingController = require('../../controllers/locking').getInstance(),
  LockingValidator = require('../validator/lockingValidator');

module.exports = function (keycloak, auth, accessManager) {
  var lockingValidator = new LockingValidator();
  lockingRouter.post('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.editScenarioAccess, lockingValidator.validateLockScenario, lockingController.lockScenario);
  lockingRouter.delete('/:scenarioId', keycloak.protect(),  auth.ensureAuthenticated, accessManager.editScenarioAccess, lockingController.removeScenarioLock);
  lockingRouter.delete('/', keycloak.protect(),  auth.ensureAuthenticated, accessManager.editScenarioAccess, lockingController.releaseLock);
  lockingRouter.put('/switch', keycloak.protect(),  auth.ensureAuthenticated, accessManager.lockSettingAccess, lockingValidator.validateToggleLock, lockingController.toggleLock);

  return lockingRouter;
};

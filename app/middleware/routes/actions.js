var express = require('express'),
actionsRouter = express.Router();

var executionsController = require('../../controllers/execution').getInstance();

module.exports = function (keycloak, auth, accessManager) {
  actionsRouter.get('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewExecutionSettingAccess, executionsController.getActions);
  actionsRouter.get('/triggers', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewExecutionSettingAccess, executionsController.getTriggers);

  return actionsRouter;
};

var express = require('express'),
  executionRouter = express.Router();

var executionController = require('../../controllers/execution').getInstance(),
  ExecutionValidator = require('../validator/executionValidator');

module.exports = function (keycloak, auth, accessManager, parser, archiving) {
  var executionValidator = new ExecutionValidator();

  executionRouter.get('/run/:scenarioId/:actionId', keycloak.protect(), auth.ensureAuthenticated, accessManager.runExecutionAccess, archiving.verifyArchive_ScenarioIdInParams, executionController.execute);
  executionRouter.get('/history/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewExecutionAccess, executionController.executionHistory);
  executionRouter.get('/history/:scenarioId/:jobId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewExecutionAccess, executionController.executionJobHistory);
  executionRouter.get('/logs/:jobId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewExecutionAccess, executionController.getExecutionLogs);
  executionRouter.delete('/stop/:scenarioId/:jobId', keycloak.protect(), auth.ensureAuthenticated, accessManager.stopExecutionAccess, archiving.verifyArchive_ScenarioIdInParams, executionController.stopExecution);
  executionRouter.get('/download/:actionId', keycloak.protect(), auth.ensureAuthenticated, accessManager.runExecutionAccess, executionController.downloadAction);
  executionRouter.post('/upload/:actionId', keycloak.protect(), auth.ensureAuthenticated, accessManager.runExecutionAccess, parser.parseData, executionValidator.validateUploadAction, archiving.verifyArchive_ScenarioIdInBody, executionController.uploadAction);

  return executionRouter;
};

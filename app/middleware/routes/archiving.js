var express = require('express'),
  archivingRouter = express.Router();

var archivingController = require('../../controllers/archiving').getInstance(),
  ArchivingValidator = require('../validator/archivingValidator');

module.exports = function (keycloak, auth, accessManager) {
  var archivingValidator = new ArchivingValidator();
  archivingRouter.post('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.archiveScenarioAccess, archivingValidator.validateArchivingScenario, archivingController.archiveScenario);

  return archivingRouter;
};

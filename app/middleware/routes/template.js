var express = require('express'),
  templateRouter = express.Router();

var templateController = require('../../controllers/template').getInstance();

module.exports = function (keycloak, auth, accessManager) {
  templateRouter.get('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewScenarioAccess, templateController.getTemplates);
  return templateRouter;
};

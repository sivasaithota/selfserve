var express = require('express'),
  bomRouter = express.Router();

var bomController = require('../../controllers/bom').getInstance(),
  parser = require('../parser/multiPartParser');

module.exports = function(keycloak, auth) {
  bomRouter.get('/', keycloak.protect(), auth.ensureAuthenticated, bomController.hasBomConfig);
  bomRouter.get('/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, bomController.getBomItems);
  bomRouter.get('/:scenarioId/value', keycloak.protect(), auth.ensureAuthenticated, bomController.getBomValues);
  return bomRouter;
};

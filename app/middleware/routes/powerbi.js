var express = require('express'),
  powerbiRouter = express.Router();

var powerbiController = require('../../controllers/powerbi'),
  PowerbiValidator = require('../validator/powerbiValidator');

module.exports = function (keycloak, auth) {
  var powerbiValidator = new PowerbiValidator();
  powerbiRouter.get('/embedUrls/', keycloak.protect(), auth.ensureAuthenticated, powerbiController().getEmbedUrls);
  powerbiRouter.post('/', keycloak.protect(),  auth.ensureAuthenticated, powerbiValidator.validateAddReport, powerbiController().addReport);
  powerbiRouter.get('/', keycloak.protect(),  auth.ensureAuthenticated, powerbiController().getReports);
  powerbiRouter.delete('/:reportId', keycloak.protect(),  auth.ensureAuthenticated, powerbiController().deleteReport);
  powerbiRouter.put('/:reportId', keycloak.protect(),  auth.ensureAuthenticated, powerbiValidator.validateAddReport, powerbiController().editReport);
  powerbiRouter.post('/:reportId/changeorder', keycloak.protect(),  auth.ensureAuthenticated, powerbiController().updateOrderId);
  powerbiRouter.get('/imports', keycloak.protect(),  auth.ensureAuthenticated, powerbiValidator.validateGetImportSetting, powerbiController().getImportSettings);
  powerbiRouter.put('/imports/:id', keycloak.protect(),  auth.ensureAuthenticated, powerbiValidator.validateUpdateImportSetting, powerbiController().updateImportSetting);
  powerbiRouter.post('/refresh', keycloak.protect(),  auth.ensureAuthenticated, powerbiValidator.validateRefreshReport, powerbiController().refreshReports);

  return powerbiRouter;
};

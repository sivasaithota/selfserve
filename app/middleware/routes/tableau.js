var express = require('express'),
  tableauRouter = express.Router();

var tableauController = require('../../controllers/tableau').getInstance(),
  TableauValidator = require('../validator/tableauValidator');

module.exports = function (keycloak, auth, accessManager) {
  var tableauValidator = new TableauValidator();
  tableauRouter.get('/ticket', keycloak.protect(), auth.ensureAuthenticated, tableauController.getTicket);
  tableauRouter.get('/runExtract/:scenarioId', keycloak.protect(),  auth.ensureAuthenticated, accessManager.runExecutionAccess, tableauValidator.validateRunExtract, tableauController.runExtract);
  tableauRouter.get('/workbooks', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauController.getAllWorkbooks);
  tableauRouter.get('/users', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauController.getAllUsers);
  tableauRouter.get('/', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauController.getTableau);
  tableauRouter.post('/', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauValidator.validateTableau, tableauController.addTableau);
  tableauRouter.put('/:tableauId', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauValidator.validateTableau, tableauController.editTableau);
  tableauRouter.delete('/:tableauId', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauController.deleteTableau);
  tableauRouter.put('/changeorder/:tableauId', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauController.changeOrderId);
  tableauRouter.get('/extract', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauValidator.validateGetExtractSetting, tableauController.getExtractSetting);
  tableauRouter.put('/extract/:id', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauValidator.validateUpdateExtractSetting, tableauController.updateExtractSetting);
  tableauRouter.get('/reportsUser', keycloak.protect(),  auth.ensureAuthenticated, accessManager.tableauSettingAccess, tableauController.getReportsUserData);
  return tableauRouter;
};

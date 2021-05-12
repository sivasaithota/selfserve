var express = require('express'),
  scenarioRouter = express.Router();

var scenarioController = require('../../controllers/scenario').getInstance(),
  parser = require('../parser/multiPartParser'),
  ScenarioValidator = require('../validator/scenarioValidator');

module.exports = function (keycloak, auth, accessManager, parser,  archiving) {
  var scenarioValidator = new ScenarioValidator();
  scenarioRouter.get('/notebook', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewScenarioAccess, scenarioController.openNotebook);
  scenarioRouter.delete('/notebook', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewScenarioAccess, scenarioController.removeNotebook);
  scenarioRouter.get('/all', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewScenarioAccess, scenarioController.getAllScenario);
  scenarioRouter.get('/allTables', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getAllTables);
  scenarioRouter.get('/tables/:templateID', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getTemplateTables);
  scenarioRouter.post('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.addScenarioAccess, scenarioValidator.validateAddScenario, scenarioController.addScenario);
  scenarioRouter.get('/grid', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.loadGrid);
  scenarioRouter.get('/grid/download', keycloak.protect(), auth.ensureAuthenticated, accessManager.downloadGridDataAccess, scenarioValidator.validateDownloadGridData, scenarioController.downloadGridData);
  scenarioRouter.post('/:scenarioId/grid/upload', keycloak.protect(), auth.ensureAuthenticated, accessManager.UploadGridDataAccess, parser.parseData, scenarioValidator.validateUploadGridData, archiving.verifyArchive_ScenarioIdInParams, scenarioController.uploadGridData);
  scenarioRouter.post('/grid/add', keycloak.protect(), auth.ensureAuthenticated, accessManager.addGridDataAccess, scenarioValidator.validateGridData, archiving.verifyArchive_ScenarioIdInQuery, scenarioController.addGridData);
  scenarioRouter.post('/grid/edit', keycloak.protect(), auth.ensureAuthenticated, accessManager.editGridDataAccess, scenarioValidator.validateGridData, archiving.verifyArchive_ScenarioIdInQuery, scenarioController.editGridData);
  scenarioRouter.post('/grid/cell/edit', keycloak.protect(), auth.ensureAuthenticated, accessManager.editGridDataAccess, scenarioValidator.validateGridData, archiving.verifyArchive_ScenarioIdInQuery, scenarioController.editCellData);
  scenarioRouter.post('/grid/delete', keycloak.protect(), auth.ensureAuthenticated, accessManager.deleteGridDataAccess, scenarioValidator.ValidateDeleteGridData, archiving.verifyArchive_ScenarioIdInQuery, scenarioController.deleteGridData);
  scenarioRouter.get('/tables/:tableType/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getTablesByType);
  scenarioRouter.get('/params', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewParameterAccess, scenarioController.getParameters);
  scenarioRouter.post('/param', keycloak.protect(), auth.ensureAuthenticated, accessManager.editParameterAccess, scenarioValidator.validateSaveParameter, archiving.verifyArchive_ScenarioIdInBody, scenarioController.saveParameter);
  scenarioRouter.get('/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewScenarioAccess, scenarioController.getScenario);
  scenarioRouter.put('/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.editScenarioAccess, archiving.verifyArchive_ScenarioIdInParams, scenarioValidator.validateUpdateScenario, scenarioController.updateScenario);
  scenarioRouter.post('/copy/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.copyScenarioAccess, scenarioValidator.validateCopyScenario, scenarioController.copyScenario);
  scenarioRouter.delete('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.deleteScenarioAccess, scenarioValidator.validateDeleteScenario, scenarioController.deleteScenario);
  scenarioRouter.get('/tableau/:scenarioId/:tableType', keycloak.protect(), auth.ensureAuthenticated, scenarioController.tableUrl);
  scenarioRouter.get('/output/html/:scenarioId', scenarioController.getHtml);
  scenarioRouter.get('/output/pdf/:scenarioId', scenarioController.getPDF);
  scenarioRouter.get('/page/info/:scenarioId', scenarioController.pageInfo);
  scenarioRouter.put('/changeorder/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.editScenarioAccess, archiving.verifyArchive_ScenarioIdInParams, scenarioController.changeOrderId);
  scenarioRouter.get('/tables/download/:tableType/:scenarioId/:useDisplayName', keycloak.protect(), auth.ensureAuthenticated, accessManager.downloadGridDataAccess, scenarioController.downloadTablesByType);
  scenarioRouter.get('/:scenarioId/grid/edit/table', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioValidator.validateTableEditOptions, scenarioController.getTableEditOptions);
  scenarioRouter.get('/:scenarioId/grid/edit/column', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioValidator.validateGridEditColumnValues, scenarioController.getGridEditColumnValues);
  scenarioRouter.get('/:scenarioId/parametersList', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewParameterAccess, scenarioValidator.validateParametersList, scenarioController.getParametersList);
  scenarioRouter.get('/:scenarioId/grid/filter/range', keycloak.protect(), auth.ensureAuthenticated, scenarioValidator.validateRangeOptions, scenarioController.getGridRangeValues);
  scenarioRouter.post('/grid/multiedit', keycloak.protect(), auth.ensureAuthenticated, accessManager.editGridDataAccess, scenarioValidator.validateMultiEdit, archiving.verifyArchive_ScenarioIdInQuery, scenarioController.multiEditGridData);
  scenarioRouter.post('/grid/id', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getGridId);
  scenarioRouter.get('/tags/list', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewScenarioAccess, scenarioController.getTags);
  scenarioRouter.post('/tags/save', keycloak.protect(), auth.ensureAuthenticated, accessManager.addScenarioAccess, scenarioValidator.validateSaveTags, scenarioController.saveTags);
  scenarioRouter.post('/:scenarioId/grid/upload/zip', keycloak.protect(), auth.ensureAuthenticated, accessManager.UploadGridDataAccess, archiving.verifyArchive_ScenarioIdInParams, parser.parseData, scenarioValidator.validateUploadZipForGridData, scenarioController.uploadZipForGridData);
  scenarioRouter.post('/grid/id', auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getGridId);
  scenarioRouter.get('/grid/row', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getRowData);
  scenarioRouter.get('/grid/filter', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getRowFilter);
  scenarioRouter.get('/updatedInputsParameters/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getUpdatedInputsParameters);
  scenarioRouter.get('/count/resource/:scenarioId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewGridDataAccess, scenarioController.getResourceCount);
  return scenarioRouter;
};
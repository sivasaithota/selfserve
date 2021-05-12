var express = require('express'),
  macroRouter = express.Router();

var macroController = require('../../controllers/macro').getInstance(),
  MacroValidator = require('../validator/macroValidator');
  ScenarioValidator = require('../validator/scenarioValidator');

module.exports = function (auth, parser) {
  var macroValidator = new MacroValidator();
  macroRouter.get('/workbook/download', macroController.getWorkbook);
  macroRouter.post('/workbook/upload', parser.parseData, macroValidator.validateUpload, macroController.uploadWorkbook);

  return macroRouter;
};

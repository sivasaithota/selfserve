var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var TableauValidator = function () {};

TableauValidator.prototype.validateTableau = function (req, res, next) {
  var type = ['input', 'output'];
  var controllerHelper = new ControllerHelper(res),
    tableauObject = req.body;
  if (!tableauObject || Object.keys(tableauObject).length <= 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.tableauObjectEmpty
    });
  } else if (!tableauObject.label || tableauObject.label.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.labelNotFound
    });
  } else if (!tableauObject.url || tableauObject.url.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.urlNotFound
    });
  } else if (!tableauObject.type || type.indexOf(tableauObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.typeNotFound
    });
  } else if (tableauObject.project && tableauObject.project.trim() !== '' && (!tableauObject.workbook || tableauObject.workbook.trim() === '')) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.projectWorkbookNotFound
    });
  } else if (isNaN(tableauObject.scenario_template_id)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  } else next();
};

TableauValidator.prototype.validateGetTableau = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    queryObject = req.query;
  if (!queryObject || Object.keys(queryObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.tableauObjectEmpty
    });
  } else if (isNaN(queryObject.scenario_template_id)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  } else next();
};

/*****
this function validate query object to get tableau extract setting
Scenario template is a mandatory field, if not passed, bad request error will be thrown
*****/

TableauValidator.prototype.validateGetExtractSetting = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    queryObject = req.query;
  if (!queryObject || Object.keys(queryObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.queryObjectNotFound
    });
  } else if (!queryObject.scenarioTemplateId || isNaN(queryObject.scenarioTemplateId)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  } else next();
};

/*****
this function will validate body object to update tableau extract setting
run extract value should be true/false
*****/
TableauValidator.prototype.validateUpdateExtractSetting = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || Object.keys(bodyObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.tableauExtractSettingNotFound
    });
  } else if ((JSON.parse(bodyObject.runExtract) !== true && JSON.parse(bodyObject.runExtract) !== false)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.runExtractInvalid
    });
  } else next();
};


/*****
This function validates query object to run the tableau extract
it will bad request error if segement,type passed and not matching with given segment,types
typeId is mandatory field to run tableau extract
*****/

TableauValidator.prototype.validateRunExtract = function (req, res, next) {
  var types = ['action', 'scenario', 'data', 'script'],
    segment = ['input', 'output'];
  var controllerHelper = new ControllerHelper(res),
    queryObject = req.query;
  if (!queryObject.typeId) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.typeIdNotFound
    });
  } else if (queryObject.type && types.indexOf(queryObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.invalidType
    });
  } else if (queryObject.segment && segment.indexOf(queryObject.segment) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tableau.invalidSegment
    });
  } else next();
};

module.exports = TableauValidator;

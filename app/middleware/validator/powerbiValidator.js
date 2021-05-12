var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var PowerbiValidator = function () {};

PowerbiValidator.prototype.validateAddReport = function (req, res, next) {
  var type = ['input', 'output'];
  var controllerHelper = new ControllerHelper(res),
    requestObject = req.body;
  if (!requestObject || Object.keys(requestObject).length <= 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.powerbi.requestBodyEmpty
    });
  } else if (!requestObject.label || requestObject.label.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.powerbi.labelNotFound
    });
  } else if (!requestObject.url || requestObject.url.trim() === '' &&
      (requestObject.url.indexOf('groups') !== -1 &&
        (requestObject.url.indexOf('reports') !== -1 || requestObject.url.indexOf('dashboards') !== -1))) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.powerbi.reportUrlNotFound
    });
  } else if (!requestObject.type || type.indexOf(requestObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.powerbi.reportTypeNotFound
    });
  } else if (isNaN(requestObject.scenario_template_id)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  } else next();
};

PowerbiValidator.prototype.validateGetImportSetting = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    queryObject = req.query;
  if (!queryObject || !queryObject.scenarioTemplateId || isNaN(queryObject.scenarioTemplateId)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  } else next();
};

PowerbiValidator.prototype.validateUpdateImportSetting = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || (JSON.parse(bodyObject.run_import) !== true && JSON.parse(bodyObject.run_import) !== false)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.powerbi.runImportNotValid
    });
  } else next();
};

PowerbiValidator.prototype.validateRefreshReport = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    queryObject = req.query;
  if (!queryObject || !queryObject.scenarioId || isNaN(queryObject.scenarioId)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else next();
};

module.exports = PowerbiValidator;

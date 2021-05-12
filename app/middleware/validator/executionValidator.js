var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var ExecutionValidator = function () {};

var _executionTypes = ['input_refresh', 'output_refresh', 'scripts', 'input_validation', 'output_validation', 'download', 'upload'],
  _commandTypes = ['python3', 'Rscript', 'sh', 'python', 'node', 'pandoc', 'python-tika', 'r-py-gurobi', 'dotnetcore', 'java8', 'java14'],
  _segments = ['input', 'output'];

ExecutionValidator.prototype.validateExecutionSetting = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || Object.keys(bodyObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.executionSettingNotFound
    });
  } else if (!bodyObject.type || _executionTypes.indexOf(bodyObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.executionTypeNotFound
    });
  } else if (!bodyObject.scenario_template_id || isNaN(bodyObject.scenario_template_id)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.scenarioTemplateIdNotFound
    });
  } else if (Object.keys(bodyObject).indexOf('scenario_specific') >= 0 && (JSON.parse(bodyObject.scenario_specific) !== true && JSON.parse(bodyObject.scenario_specific) !== false)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.scenarioSpecificNotValid
    });
  } else {
    switch (bodyObject.type) {
      case 'download':
        next();
        break;
      case 'upload':
        next();
        break;
      case 'scripts':
        _checkCommandToExecute(bodyObject);
        _checkForScriptId(bodyObject);
        next();
        break;
      default:
        _checkCommandToExecute(bodyObject);
        _checkForScriptId(bodyObject);
        if (!bodyObject.segment || _segments.indexOf(bodyObject.segment) < 0) {
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.execution.invalidSegment
          });
        } else if (!bodyObject.action_desc || bodyObject.action_desc.trim() === '') {
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.execution.actionDescriptionNotFound
          });
        } else next();
        break;
    }
  }
};

ExecutionValidator.prototype.validateUploadAction = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || Object.keys(bodyObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.uploadActionNotFound
    });
  } else if (!bodyObject.scenarioId && isNaN(bodyObject.scenarioId)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.scenarioIdNotFound
    });
  } else if (!bodyObject.file) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.execution.uploadFileNotFound
    });
  } else next();
};

var _checkForScriptId = function (bodyObject) {
  if (!bodyObject.script_id || isNaN(bodyObject.script_id)) {
    throw {
      code: constants.httpCodes.badRequest,
      message: constants.execution.scriptNotFound
    };
  }
  return true;
};
var _checkCommandToExecute = function (bodyObject) {
  if (!bodyObject.command_to_execute || _commandTypes.indexOf(bodyObject.command_to_execute) < 0) {
    throw {
      code: constants.httpCodes.badRequest,
      message: constants.execution.executionCommandNotFound
    };
  }
  return true;
};

module.exports = ExecutionValidator;
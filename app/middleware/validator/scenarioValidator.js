var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper'),
  logger = require('../../logger');

var namePattern = /^[a-zA-Z0-9\ ._-]*$/,
  types = ['input', 'output'];

var ScenarioValidator = function () {};

ScenarioValidator.prototype.validateAddScenario = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.body;
  if (!scenarioObject || Object.keys(scenarioObject).length === 0) {
    logger.error(req.appData.appId, 'Scenario object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });
  } else if (!scenarioObject.name || !scenarioObject.name.trim()) {
    logger.error(req.appData.appId, 'Scenario name not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotFound
    });
  } else if (!scenarioObject.templateId) {
    logger.error(req.appData.appId, 'Scenario template id not passed!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.sceanrio.scenarioTemplateNotFound
    });
  } else if (!scenarioObject.tag || scenarioObject.tag == "untagged") {
    logger.error(req.appData.appId, 'Scenario tag not passed!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tag.tagNameNotFound
    });
  } else if (!namePattern.exec(scenarioObject.name)) {
    logger.error(req.appData.appId, 'Scenario name containes special symbols!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotValidPattern
    });
  } else if (scenarioObject.name.length > 80) {
    logger.error(req.appData.appId, 'Scenario name containes more than 80 characters!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotValidLength
    });
  } else next();
};

ScenarioValidator.prototype.validateSaveTags = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    tagObject = req.body;
  if (!tagObject || Object.keys(tagObject).length === 0) {
    logger.error(req.appData.appId, 'tag object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tag.tagObjectEmpty
    });
  } else if (!tagObject.tagName || !tagObject.tagName.trim()) {
    logger.error(req.appData.appId, 'tag name not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tag.tagNameNotFound
    });
  } else if (tagObject.tagName.length > 40) {
    logger.error(req.appData.appId, 'Tag name containes more than 40 characters!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tagNameNotValidLength
    });
  } else if (!namePattern.exec(tagObject.tagName)) {
    logger.error(req.appData.appId, 'Tag name containes special symbols!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tagNameNotValidPattern
    });
  } else next();

};

ScenarioValidator.prototype.validateUpdateScenario = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.body;
  if (!scenarioObject || Object.keys(scenarioObject).length <= 0) {
    logger.error(req.appData.appId, 'Update object not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });
  } else if (scenarioObject.name.length <= 0) {
    logger.error(req.appData.appId, 'Scenario name is blank');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotFound
    });
  } else if (scenarioObject.tagID.length <= 0) {
    logger.error(req.appData.appId, 'Scenario tags is blank');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.tag.tagNameNotFound
    });
  } else if (!namePattern.exec(scenarioObject.name)) {
    logger.error(req.appData.appId, 'Scenario name containes special symbols!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotValidPattern
    });
  } else if (scenarioObject.name.length > 80) {
    logger.error(req.appData.appId, 'Scenario name containes more than 80 characters!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotValidLength
    });
  } else next();
};

ScenarioValidator.prototype.validateCopyScenario = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.body;
  if (!scenarioObject || Object.keys(scenarioObject).length <= 0) {
    logger.error(req.appData.appId, 'Update object not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });
  } else if (scenarioObject.newScenarioName.length <= 0) {
    logger.error(req.appData.appId, 'Scenario name is blank');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotFound
    });
  } else if (!namePattern.exec(scenarioObject.newScenarioName)) {
    logger.error(req.appData.appId, 'Scenario name containes special symbols!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotValidPattern
    });
  } else if (scenarioObject.newScenarioName.length > 80) {
    logger.error(req.appData.appId, 'Scenario name containes more than 80 characters!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioNameNotValidLength
    });
  } else next();
};

ScenarioValidator.prototype.validateDownloadGridData = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    queryParams = req.query;
  if (!queryParams || Object.keys(queryParams).length <= 0) {
    logger.error(req.appData.appId, 'Error finding query string!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.queryParamNotFound
    });
  } else if (!queryParams.scenarioId || queryParams.scenarioId == "undefined") {
    logger.error(req.appData.appId, 'Error finidng scenario id!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else if (!queryParams.tablename || queryParams.tablename == "undefined") {
    logger.error(req.appData.appId, 'Error finding table name!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tablenameNotFound
    });
  } else if (!queryParams.type || queryParams.type == "undefined") {
    logger.error(req.appData.appId, 'Error finding type!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else next();
};

/*****
It validates body object for the upload grid data.
scenarioId, Table Name and file are mandatory object.
only, csv, xls, xlsx files are allowed.
For xls and xlsx , file size should not execeed 40mb
*****/

ScenarioValidator.prototype.validateUploadGridData = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || Object.keys(bodyObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.uploadObjectNotFound
    });
  } else if (!bodyObject.dataTableName || bodyObject.dataTableName.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.dataTableNameNotFound
    });
  } else if (!bodyObject.tableType || types.indexOf(bodyObject.tableType) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (!bodyObject.file) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.fileNotFound
    });
  } else {
    var filesize = Math.round(bodyObject.file.size / (1024 * 1024));
    var extension = bodyObject.file.name.split('.');
    extension = extension[extension.length - 1].toLowerCase();
    var validExtensions = ['csv', 'xlsx', 'xls'];
    if (validExtensions.indexOf(extension) < 0) {
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.invalidFileExtension
      });
    } else if ((extension === 'xlsx' || extension === 'xls') && filesize > 40) {
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.invalidFileSize
      });
    } else next();
  }
};

ScenarioValidator.prototype.validateGridData = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body,
    queryObject = req.query;
  if (!queryObject) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.queryStringNotFound
    });
  } else if (!queryObject.scenarioId) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else if (!queryObject.tableName) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tablenameNotFound
    });
  } else if (!queryObject.type || types.indexOf(queryObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (!bodyObject) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.gridDataNotFound
    });
  } else next();
};

ScenarioValidator.prototype.validateMultiEdit = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body,
    queryObject = req.query;
  if (!queryObject) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.queryStringNotFound
    });
  } else if (!queryObject.scenarioId) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else if (!queryObject.type || types.indexOf(queryObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (!queryObject.tableName) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tablenameNotFound
    });
  } else if (!bodyObject) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.gridDataNotFound
    });
  } else if (!bodyObject.rowsId) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.noRowsToEdit
    });
  } else if (!bodyObject.rowsData || bodyObject.rowsData.length == 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.noRowDataToEditPassed
    });
  } else next();
};

ScenarioValidator.prototype.ValidateDeleteGridData = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body,
    queryObject = req.query;
  if (!queryObject) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.queryStringNotFound
    });
  } else if (!queryObject.scenarioId) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else if (!queryObject.type || types.indexOf(queryObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (!queryObject.tableName) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tablenameNotFound
    });
  } else if (!bodyObject) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.gridDataNotFound
    });
  } else next();
};

ScenarioValidator.prototype.validateSaveParameters = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    object = req.body,
    paramFlag = true;
  if (!object) {
    logger.error(req.appData.appId, 'Error! Save parameter object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.saveParameterObjectNotFound
    });
  } else if (!object.scenarioId) {
    logger.error(req.appData.appId, 'Error! Scenario id not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  }
  if (!object.parameters || object.parameters.length === 0) {
    paramFlag = false;
    logger.error(req.appData.appId, 'Error! No parameters found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.paramNotFound
    });
  } else {
    object.parameters.forEach(function (list) {
      list.parameters.forEach(function (param) {
        if (!param.id) {
          paramFlag = false;
          logger.error(req.appData.appId, 'Error! No parameter id found!');
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.scenario.paramIdNotFound
          });
        } else if (!param.type || !param.type.trim()) {
          paramFlag = false;
          logger.error(req.appData.appId, 'Error! No parameter id found!');
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.scenario.paramTypeNotFound
          });
        } else if (!param.parameter) {
          paramFlag = false;
          logger.error(req.appData.appId, 'Error! No parameter name found!');
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.scenario.paramNameNotFound
          });
        } else if (!param.displayname) {
          paramFlag = false;
          logger.error(req.appData.appId, 'Error! No parameter display name found!');
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.scenario.paramDisplayNameNotFound
          });
        }
      });
    });
  }
  if (paramFlag) next();
};

ScenarioValidator.prototype.validateSaveParameter = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    object = req.body,
    paramFlag = true;
  if (!object) {
    logger.error(req.appData.appId, 'Error! Save parameter object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.saveParameterObjectNotFound
    });
  } else if (!object.scenarioId) {
    logger.error(req.appData.appId, 'Error! Scenario id not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  }
  if (!object.parameter) {
    paramFlag = false;
    logger.error(req.appData.appId, 'Error! No parameters found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.paramNotFound
    });
  } else {
    if (!object.parameter.id) {
      paramFlag = false;
      logger.error(req.appData.appId, 'Error! No parameter id found!');
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.paramIdNotFound
      });
    } else if (!object.parameter.type || !object.parameter.type.trim()) {
      paramFlag = false;
      logger.error(req.appData.appId, 'Error! No parameter id found!');
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.paramTypeNotFound
      });
    } else if (!object.parameter.parameter) {
      paramFlag = false;
      logger.error(req.appData.appId, 'Error! No parameter name found!');
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.paramNameNotFound
      });
    } else if (!object.parameter.displayname) {
      paramFlag = false;
      logger.error(req.appData.appId, 'Error! No parameter display name found!');
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.paramDisplayNameNotFound
      });
    }
  }
  if (paramFlag) next();
};

ScenarioValidator.prototype.validateRangeOptions = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.query;
  if (!scenarioObject || Object.keys(scenarioObject).length === 0) {
    logger.error(req.appData.appId, 'Scenario object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });
  } else if (!scenarioObject.tableName || !scenarioObject.tableName.trim()) {
    logger.error(req.appData.appId, 'Scenario name not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tableNameNotFound
    });
  } else next();
};

ScenarioValidator.prototype.validateGridEditColumnValues = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    queryObject = req.query;
  if (!queryObject || Object.keys(queryObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.editGridQueryObjectNotFound
    });
  } else if (!queryObject.type || ['input', 'output'].indexOf(queryObject.type) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (!queryObject.tableName || queryObject.tableName.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tableNameNotFound
    });
  } else if (!queryObject.columnName || queryObject.columnName.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.columnNameNotFound
    });
  } else next();
};

ScenarioValidator.prototype.validateTableEditOptions = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.query;
  if (!scenarioObject || Object.keys(scenarioObject).length === 0) {
    logger.error(req.appData.appId, 'Scenario object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });
  } else if (!scenarioObject.tableName || !scenarioObject.tableName.trim()) {
    logger.error(req.appData.appId, 'Scenario name not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tableNameNotFound
    });
  } else if (!scenarioObject.type || !scenarioObject.type.trim()) {
    logger.error(req.appData.appId, 'Scenario name not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (scenarioObject.type != 'input' && scenarioObject.type != 'output') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.invalidType
    })
  } else next();
};

ScenarioValidator.prototype.validateParametersList = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.query;
  if (!scenarioObject || Object.keys(scenarioObject).length === 0) {
    logger.error(req.appData.appId, 'Scenario object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });
  } else if (!scenarioObject.groupName || !scenarioObject.groupName.trim()) {
    logger.error(req.appData.appId, 'Group name not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.tableNameNotFound
    });
  } else if (!scenarioObject.displayName || !scenarioObject.displayName.trim()) {
    logger.error(req.appData.appId, 'displayName not found');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else next();
};

ScenarioValidator.prototype.validateDeleteScenario = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    scenarioObject = req.query;
  if (!scenarioObject || Object.keys(scenarioObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioObjectEmpty
    });

  } else if (!scenarioObject.scenarioIds || scenarioObject.scenarioIds.trim() === '' || scenarioObject.scenarioIds.split(',').length == 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else next();
};

ScenarioValidator.prototype.validateUploadZipForGridData = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || Object.keys(bodyObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.uploadObjectNotFound
    });
  } else if (!bodyObject.tableType || types.indexOf(bodyObject.tableType) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.typeNotFound
    });
  } else if (!bodyObject.file) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.fileNotFound
    });
  } else {
    var extension = bodyObject.file.name.split('.');
    extension = extension[extension.length - 1].toLowerCase();
    var validExtensions = ['zip'];
    if (validExtensions.indexOf(extension) < 0) {
      controllerHelper.sendErrorResponse({
        code: constants.httpCodes.badRequest,
        message: constants.scenario.invalidFileExtension
      });
    } else next();
  }
};

ScenarioValidator.prototype.validateMasterTableRefresh = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res);
  if (!req.query || !req.query.scenarioIds || req.query.scenarioIds.trim() === '' || req.query.scenarioIds.split(',').length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else next();
};

var _isValidUploadFile = function (filename) {
  var extensions = ['csv', 'xls', 'xlsx'];
  var filepart = filename.split('.'),
    isValid = false;
  if (filepart && filepart.length > 0) {
    if (extensions.indexOf(filepart[filepart.length - 1]) >= 0) {
      isValid = true;
    }
  }
  return isValid;
};


module.exports = ScenarioValidator;

var util = require('util');

var _instance;

var ControllerHelper = require('../../common/controllerHelper'),
  scenarioService = require('../../services/scenario').getInstance(),
  logger = require('../../logger'),
  constants = require('../../common/constants'),
  lockingService = require('../../services/locking').getInstance();

var {
  getConnectorAccessToken
} = require('../../services/connector');
const Filer = require('../../common/filer');

var Scenario = function () {};

/*****
Function to retrieve a list of existing scenarios
*****/

Scenario.prototype.getAllScenario = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving all scenarios...');

  var controllerHelper = new ControllerHelper(res);
  var userId = constants.restrictedAccessRoles.includes(req.user.role) ? req.user.id : false;
  lockingService.checkLocks({
      releaseLock: true,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.getAllScenario(userId, req.query.type, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved scenarios.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving scenarios!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to retrieve a list of existing tables accessible for a user
*****/

Scenario.prototype.getAllTables = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving all scenarios...');
  var controllerHelper = new ControllerHelper(res);
  var query = Number(req.query.userId) == req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ?
    req.query : false;
  lockingService.checkLocks({
      releaseLock: true,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.getAllTables(query, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved tables.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving tables!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to add a new scenario taking as input the scenario name and notes
*****/

Scenario.prototype.addScenario = function (req, res) {
  logger.info(req.appData.appId, 'Adding new scenario...');
  var controllerHelper = new ControllerHelper(res);
  getConnectorAccessToken(req.headers.authorization)
    .then(({
      accessToken,
      refreshToken
    }) => {
      var scenarioObject = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        ...req.body,
      };
      return scenarioService.addScenario(scenarioObject, req.user.username, req.headers.authorization, req.appData.appId)
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully added scenario.');
      controllerHelper.sendResponse(constants.httpCodes.successfulCreate, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error adding scenario!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to retrieve a particular scenario taking scenario id as input
*****/

Scenario.prototype.getScenario = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving scenario...');
  var controllerHelper = new ControllerHelper(res);
  scenarioService.getScenario(req.params.scenarioId, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Scenario retrieved successfully', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting scenario!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to edit existing scenario taking new scenario name as input
*****/

Scenario.prototype.updateScenario = function (req, res) {
  logger.info(req.appData.appId, 'Updating scenario...');
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.params.scenarioId,
      username: req.user.username,
      explicitLock: true
    }, req.appData.appId)
    .then(function () {
      return scenarioService.updateScenario(req.params.scenarioId, req.body, req.user.username, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully updated scenario name.');
      controllerHelper.sendResponse(constants.httpCodes.success, {
        message: util.format(constants.scenario.updateSuccess, req.body.name),
        result: result
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error updating scenario!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    }).finally(function () {
      lockingService.removeLock({
        scenarioId: req.params.scenarioId,
        username: req.user.username
      }, req.appData.appId);
    });
}


/*****
Function to retrieve a all the tags of an particular app
*****/

Scenario.prototype.getTags = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving tags...');
  var controllerHelper = new ControllerHelper(res);
  scenarioService.getTags(req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Tags retrieved successfully', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting tags!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to save a new tag
*****/

Scenario.prototype.saveTags = function (req, res) {
  logger.info(req.appData.appId, 'Saving tags...');
  var controllerHelper = new ControllerHelper(res);
  scenarioService.saveTags(req.body, req.user.username, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully saved a tag.');
      controllerHelper.sendResponse(constants.httpCodes.success, {
        message: constants.tag.updateSuccess,
        result: result
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error saving tag!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    })
}

/*****
Function to validate if the inputs to add scenario are present
*****/

Scenario.prototype.copyScenario = function (req, res) {
  logger.info(req.appData.appId, 'Copying scenario...');
  var controllerHelper = new ControllerHelper(res);
    scenarioService.copyScenario(req.params.scenarioId, req.body.newScenarioName, req.user.username, req.headers.authorization, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully copied scenario.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error copying scenario!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
}

/*****
Function to delete a scenario taking scenario id as input.
*****/

Scenario.prototype.deleteScenario = function (req, res) {
  logger.info(req.appData.appId, 'Deleting scenario');
  var controllerHelper = new ControllerHelper(res);
  lockingService.verifyLockForMultipleScenarios(req.query.scenarioIds.split(','),req.user.username,req.appData.appId)
  .then (function(){
    return scenarioService.deleteScenario(req.query.scenarioIds, req.user.username, req.headers.authorization, req.appData.appId);
  })
  .then(function (result) {
    logger.info(req.appData.appId, 'Successfully deleted sceanrio.', {
      Outcome: result
    });
    controllerHelper.sendResponse(constants.httpCodes.success, result);
  })
  .catch(function (err) {
    logger.error(req.appData.appId, 'Error deleting scenario!', {
      error: err
    });
    controllerHelper.sendErrorResponse(err);
  });
};

/*****
Function to retrieve parameters.
*****/

Scenario.prototype.getParameters = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving parameters...');
  var controllerHelper = new ControllerHelper(res);
  if (!req.query || !req.query.scenarioId) {
    logger.error(req.appData.appId, 'Error finding scenario!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenario.scenarioIdNotFound
    });
  } else {
    scenarioService.getParameters(req.query.scenarioId, req.appData.appId)
      .then(function (result) {
        logger.info(req.appData.appId, 'Successfully retrieved parameters.', {
          Outcome: result
        });
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        logger.error(req.appData.appId, 'Error retrieving parameters!', {
          Outcome: err
        });
        controllerHelper.sendErrorResponse(err);
      });
  };
};

/*****
Function to get inputs.
*****/

Scenario.prototype.getTablesByType = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  var query = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ?
    req.query : false;
  scenarioService.getTablesByType(req.params, query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully get input tables.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving scenarios!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to get tables count.
*****/

Scenario.prototype.getResourceCount = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  var query = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ?
    req.query.userId : null;
  scenarioService.getResourceCount(req.params, query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully get resource count.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving resource count!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to load the grid.
*****/

Scenario.prototype.loadGrid = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  var queryParams = {
    page: req.query.page,
    limit: req.query.rows,
    sortColumns: req.query.sidx,
    sort: req.query.sord,
    filter: (req.query.filters) ? JSON.parse(req.query.filters) : null,
    query: req.query.query,
    scenarioId: req.query.scenarioId,
    tablename: req.query.tablename,
    metaInfo: (req.query.metaInfo) ? JSON.parse(req.query.metaInfo) : false
  };
  logger.info(req.appData.appId, 'Loading grid...');
  scenarioService.loadGrid(queryParams, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully loaded grid.'); //Not printing result as it will be too huge laoding all the data.
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error loading grid!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to downlaod grid.
*****/

Scenario.prototype.downloadGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Downloading grid...');
  scenarioService.downloadGridData(req.query, req.appData.database, req.appData.appId)
    .then(function (filePath) {
      logger.info(req.appData.appId, 'Successfully downloaded grid.', filePath);
      controllerHelper.download(filePath);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error downloading grid!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to upload grid.
validates the body object for scenario id, table name, file
*****/

Scenario.prototype.uploadGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.params.scenarioId,
      username: req.user.username,
      explicitLock: true
    }, req.appData.appId)
    .then(function () {
      logger.info(req.appData.appId, 'Uploading grid data....');
      return scenarioService.uploadGridData(req.params.scenarioId, req.body, req.user.username, req.appData.database, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully uploaded grid data.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error uploading grid data!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    }).finally(function () {
      lockingService.removeLock({
        scenarioId: req.params.scenarioId,
        username: req.user.username
      }, req.appData.appId);
    });
};

/*****
controller to add data to the table. tablename, scenarioid and data will be present in the request object
*****/

Scenario.prototype.addGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  //checking lock to see if it is unlocked, if so lock it and grant accesss
  lockingService.checkLocks({
      scenarioId: req.query.scenarioId,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.addGridData(req.query.scenarioId, req.query.tableName, req.body, req.query.type, req.user.username, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully add row to the table.');
      controllerHelper.sendResponse(constants.httpCodes.success);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error add row to the table!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to edit data to the table. tablename, scenarioid and data will be present in the request object
*****/

Scenario.prototype.editGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.query.scenarioId,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.editGridData(req.query.scenarioId, req.query.tableName, req.body, req.query.type, req.user.username, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully edit row to the table.');
      controllerHelper.sendResponse(constants.httpCodes.success);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error edit row to the table!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to edit data to the table cell. tablename, scenarioid and data will be present in the request object
*****/

Scenario.prototype.editCellData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.query.scenarioId,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.editCellData(req.query.scenarioId, req.query.tableName, req.body, req.query.type, req.user.username, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully edit row to the table.');
      controllerHelper.sendResponse(constants.httpCodes.success);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error edit row to the table!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to delete data from the table. tablename, scenarioid and grid id  will be present in the request object
*****/

Scenario.prototype.deleteGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.query.scenarioId,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.deleteGridData(req.query.scenarioId, req.query.tableName, req.body.id, req.query.type, req.user.username, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully add row to the table.');
      controllerHelper.sendResponse(constants.httpCodes.success);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error add row to the table!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to get tableau url based on type
*****/

Scenario.prototype.tableUrl = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  var query = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ?
    req.query : false;
  scenarioService.tableUrl(req.params.scenarioId, req.params.tableType, query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully executed script.', {
        Result: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while executing script!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to get html output using scenario id
*****/

Scenario.prototype.getHtml = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  scenarioService.getHtml(req.params.scenarioId, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendFile('scenario_' + req.params.scenarioId + '.html', result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while getting html!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to get pdf output using scenario id
*****/

Scenario.prototype.getPDF = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  scenarioService.getPDF(req.params.scenarioId, req.query, req.appData.appId)
    .then(function (file) {
      controllerHelper.setHeader('Content-Length', file.length);
      controllerHelper.writeFile(file, 'binary');
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while getting pdf!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to page info for the grid data
*****/

Scenario.prototype.pageInfo = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  scenarioService.pageInfo(req.params.scenarioId, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while getting page information!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to change order id of scenario
*****/

Scenario.prototype.changeOrderId = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Executing script...');
  scenarioService.changeOrderId(req.params.scenarioId, req.body.order_id, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while changing scenario order!', {
        error: err
      });
    });
};

Scenario.prototype.downloadTablesByType = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  var userId = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ?
    req.query.userId : false;
  logger.info(req.appData.appId, 'Downloading tables by type...');
  scenarioService.downloadTablesByType(req.params, userId, req.appData.database, req.appData.appId)
    .then(function (filePath) {
      logger.info(req.appData.appId, 'Successfully downloaded tables.');
      controllerHelper.download(filePath);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error downloading tables!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });

};

/*****
Function to save parameter.
*****/

Scenario.prototype.saveParameter = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.body.scenarioId,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.saveParameter(req.body.scenarioId, req.body.parameter, req.user.username, req.appData.appId);
    })
    .then(function () {
      logger.info(req.appData.appId, 'Successfully saved parameter.');
      controllerHelper.sendResponse(constants.httpCodes.success, {
        status: constants.scenario.parameterSuccess
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error saving parameter!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
used to load dropdown to for table edit column
*****/

Scenario.prototype.getGridEditColumnValues = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Getting edit grid column values...');
  var queryObject = req.query;
  queryObject.scenarioId = req.params.scenarioId;
  scenarioService.getGridEditColumnValues(queryObject, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retreived edit grid values...');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error saving parameter!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};


/*****
Function to retrieve a list of existing tables accessible for a user
*****/

Scenario.prototype.getParametersList = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Getting parameters list...');
  scenarioService.getParametersList({
      scenarioId: req.params.scenarioId,
      groupName: req.query.groupName,
      displayName: req.query.displayName
    }, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved parameters list options.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting edit options!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
used to get table edit option for columns
*****/

Scenario.prototype.getTableEditOptions = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Getting Table edit options...');
  scenarioService.getTableEditOptions({
      scenarioId: req.params.scenarioId,
      tableName: req.query.tableName,
      type: req.query.type
    }, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved edit options.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting edit options!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to retrieve a list of range values for columns accessible for a user
*****/

Scenario.prototype.getGridRangeValues = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Getting edit options...');
  scenarioService.getGridRangeValues({
      scenarioId: req.params.scenarioId,
      tableName: req.query.tableName
    }, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved range values.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting range values!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to multipale edit rows to the table after filtering. tablename, scenarioid and data will be present in the request object
*****/

Scenario.prototype.multiEditGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  lockingService.checkLocks({
      scenarioId: req.query.scenarioId,
      username: req.user.username
    }, req.appData.appId)
    .then(function () {
      return scenarioService.multiEditGridData(req.query.scenarioId, req.query.tableName, req.body, req.query.type, req.user.username, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully edit rows to the table after filtering.');
      controllerHelper.sendResponse(constants.httpCodes.success);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error edit rows to the table after filtering!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to get the grid ids for multi edite.
*****/

Scenario.prototype.getGridId = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  var queryParams = {
    filter: req.body ? req.body : null,
    scenarioId: req.query.scenarioId,
    tablename: req.query.tablename
  };
  logger.info(req.appData.appId, 'Getting grid id...');
  scenarioService.getGridId(queryParams, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully getted grid id.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting grid id!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
uploading zip file to update tables
*****/

Scenario.prototype.uploadZipForGridData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Uploading zip data...');
  var uploadObject = Object.assign({
    username: req.user.username,
    scenarioId: req.params.scenarioId
  }, req.body);
  lockingService.checkLocks({
      scenarioId: req.params.scenarioId,
      username: req.user.username,
      explicitLock: true
    }, req.appData.appId)
    .then(function () {
      return scenarioService.uploadZipForGridData(uploadObject, req.appData.database, req.headers.authorization, req.appData.appId);
    })
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully uploaded zip for grid.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while uploading zip for grid data!', err);
      controllerHelper.sendErrorResponse(err);
    })
    .finally(function () {
      lockingService.removeLock({
        scenarioId: req.params.scenarioId,
        username: req.user.username
      }, req.appData.appId);
    })
};

// Getting tables by template ID
Scenario.prototype.getTemplateTables = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Getting tables by template ID');
  scenarioService.getTemplateTables(req.params, req.appData.appId).then(function (result) {
    logger.info(req.appData.appId, 'Successfully retrieved tables');
    controllerHelper.sendResponse(constants.httpCodes.success, result);
  }).catch(function (err) {
    logger.error(req.appData.appId, 'Error retrieving tables', {
      error: err
    });
    controllerHelper.sendErrorResponse(err);
  });
};

/*****
Function to load the grid by id.
*****/

Scenario.prototype.getRowData = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Loading row...');
  req.query.filter = req.query.filters ? JSON.parse(req.query.filters) : null;
  req.query.metaInfo = req.query.metaInfo ? JSON.parse(req.query.metaInfo) : false;
  scenarioService.getRowData(req.query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully loaded row.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error loading row!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to load filter values.
*****/

Scenario.prototype.getRowFilter = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Loading filter values...');
  var queryParams = {
    page: req.query.page,
    limit: req.query.limit,
    filter: (req.query.filters) ? JSON.parse(req.query.filters) : null,
    metaInfo: req.query.metaInfo ? JSON.parse(req.query.metaInfo) : false,
    scenarioId: req.query.scenarioId,
    tablename: req.query.tablename,
    columnName: req.query.columnName
  };
  scenarioService.getRowFilter(queryParams, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully loaded filter values.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error loading filter values!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};


/*****
 Getting input tables and parameters updated since the last execution of the primary script
 *****/

Scenario.prototype.getUpdatedInputsParameters = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  scenarioService.getUpdatedInputsParameters(req.params, req.headers.authorization, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully fetched the updated inputs and parameters');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error fetching the updated inputs and parameters ', err);
      controllerHelper.sendErrorResponse(err);
    });
};

Scenario.prototype.openNotebook = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  scenarioService.openNotebook(req.query.actionId, req.query.scenarioId, req.headers.authorization, req.appData.appId)
    .then(function (appID) {
      var notebookURL = "/" + appID.toString() + "_notebook/";
      controllerHelper.sendResponse(constants.httpCodes.success, {
        notebookURL: notebookURL
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, constants.notebooks.openNotebookError, err);
      controllerHelper.sendErrorResponse(err);
    });
};

Scenario.prototype.removeNotebook = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  scenarioService.removeNotebook(req.headers.authorization, req.appData.appId)
    .then(function () {
      controllerHelper.sendResponse(constants.httpCodes.success);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, constants.notebooks.openNotebookError, err);
      controllerHelper.sendErrorResponse(err);
    });
};



module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Scenario();
    }
    return _instance;
  }
};
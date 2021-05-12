var Bluebird = require('bluebird'),
  util = require('util');

var dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper'),
  logger = require('../../logger'),
  constants = require('../../common/constants'),
  GridManager = require('./gridManager'),
  outputData = require('./outputdata'),
  tableauService = require('../tableau').getInstance(),
  Filer = require('../../common/filer'),
  executionService = require('../execution').getInstance(),
  lockingService = require('../locking').getInstance(),
  ScenarioHelper = require('./scenarioHelper'),
  CommonServices = require('../commonServices'),
  notebookManager = require('./notebookManager').getInstance(),
  powerbiService = require('../powerbi'),
  enframeManager = require('../enframeManager');

var scenarioHelper = new ScenarioHelper(),
  commonServices = new CommonServices();

var _instance;

var Scenario = function () {};

/********
Function to retrieve all scenarios
********/

Scenario.prototype.getAllScenario = function (userId, type, appId) {
  logger.info(appId, 'getting all scenarios...');
  var executeQuery,
    returnValue = {},
    scenarioObject = {},
    showAll = type ? false : true,
    showByType = !showAll;
  executeQuery = userId ? util.format(queryHelper.selectAllScenarioByUser, userId, showByType, type, showAll) :
    util.format(queryHelper.selectAllScenario, showByType, type, showAll);
  return dataAccess.executeQuery(appId, executeQuery)
    .then(function (result) {
      var scenarioIds = [],
        promises = [];
      logger.info(appId, 'Successfully fetched scenarios.');
      returnValue.scenarios = result.rows || [];
      promises.push(dataAccess.executeQuery(appId, queryHelper.getTemplates));
      if (result && result.rows && result.rows.length > 0) {
        result.rows.forEach(function (row) {
          scenarioObject[row.id] = row;
          scenarioObject[row.id].locking = {};
          scenarioIds.push(row.id);
        });
        promises.push(lockingService.getScenarioLock(scenarioIds, appId));
      }
      return Bluebird.all(promises);
    })
    .then(function (result) {
      if (result.length > 1) returnValue.scenarios = scenarioHelper.attachLocking(scenarioObject, result[1]); // attach locking if scenario exist
      returnValue.templates = [];
      logger.info(appId, 'Successfully retrieved list of templates.');
      returnValue.templates = result[0].rows || [];
      return returnValue;
    })
    .catch(function (err) {
      logger.error(appId, 'Error getting all scenario!', err);
      throw err;
    });
};

/********
Function to retrieve all tables
********/

Scenario.prototype.getAllTables = function (queryParams, appId) {
  logger.info(appId, 'getting all tables...');
  var executeQuery;
  if (queryParams) {
    executeQuery = util.format(queryHelper.selectAllTablesByUser, queryParams.userId);
  } else {
    executeQuery = queryHelper.selectAllTables;
  }
  return dataAccess.executeQuery(appId, executeQuery)
    .then(function (result) {
      logger.info(appId, 'Successfully executed query to get all tables', );
      return result.rows || [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/*****
Function to add a scenario taking at least the name as input
*****/

Scenario.prototype.addScenario = function (scenarioObject, username, token, appId) {
  logger.info(appId, 'Creating new scenario');
  var result;

  // Calling SQL function to create a new scenario
  return dataAccess.executeQuery(appId, util.format(
    queryHelper.addScenario,
    scenarioObject.name,
    scenarioObject.templateId,
    username,
    scenarioObject.tag,
  )).then(function (data) {
    if (data && data.rows && data.rows.length === 1) {
      result = data.rows[0];
      logger.info(appId, 'Successfully created scenario', {
        result: result
      });
      executionService.runTrigger({
        triggerType: 'scenarioCreation',
        scenarioId: result.id,
        username: username,
        refreshToken: scenarioObject.refreshToken,
        accessToken: scenarioObject.accessToken,
      }, token, appId);
      return result;
    } else {
      throw {
        code: constants.httpCodes.internalServerError,
        message: constants.scenario.errorCreatingScenario
      };
    }
  }).catch(function (err) {
    if (err.message.includes('duplicate key value')) err.message = constants.scenario.scenarioNameExists;
    logger.error(appId, 'Error creating scenario', err);
    throw err;
  });
};

/*****
Function to retrieve a scenario taking scenario id as input
*****/

Scenario.prototype.getScenario = function (scenarioId, appId) {
  logger.info(appId, 'getting scenario...', scenarioId);
  var promises = [];
  promises.push(dataAccess.executeQuery(appId, util.format(queryHelper.getScenarioById, scenarioId)));
  promises.push(lockingService.getScenarioLock([scenarioId], appId));
  return Bluebird.all(promises)
    .then(function (result) {
      var scenarioObject = {};
      if (result[0] && result[0].rows && result[0].rows.length == 1) {
        scenarioObject = result[0].rows[0];
        scenarioObject.locking = result[1][0] || {};
      }
      return scenarioObject;
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/*****
Function to update scenario taking scenario id and new name as input
*****/

Scenario.prototype.updateScenario = function (scenarioId, scenarioObject, username, token, appId) {
  logger.info(appId, 'Updating scenario', scenarioId);
  return dataAccess.executeQuery(appId, util.format(queryHelper.updateScenario, scenarioId, scenarioObject.name, scenarioObject.tagID, username))
    .then(function (result) {
      if (result && result.rowCount === 1) {
        tableauService.runExtract({
          username: username,
          type: 'scenario',
          typeName: 'Edit',
          token: token,
        }, appId);
        powerbiService().refreshImports({
          username: username,
          type: 'scenario',
          typeName: 'Edit',
          token: token,
        }, appId);
        logger.info(appId, 'Successfully updated scenario.', scenarioId);
        return result.rows[0];
      } else {
        throw {
          code: constants.httpCodes.badRequest,
          message: constants.scenario.scenarioNotFound
        };
      }
    })
    .catch(function (err) {
      if (err.message.includes('duplicate key value')) err.message = constants.scenario.scenarioNameExists;
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/*****
Function to copy an existing scenario.
*****/

Scenario.prototype.copyScenario = function (scenarioId, newScenarioName, username, token, appId) {
  logger.info(appId, ' Copying scenario...', scenarioId);
  return dataAccess.executeQuery(appId, util.format(queryHelper.copyScenario, scenarioId, newScenarioName, username))
    .then(function (result) {
      logger.info(appId, 'Successfully executed query to copy scenario.', scenarioId);
      if (result && result.rows && result.rows.length === 1) {
        tableauService.runExtract({
          username: username,
          type: 'scenario',
          typeName: 'Copy',
          token: token,
        }, appId);

        powerbiService().refreshImports({
          username: username,
          type: 'scenario',
          typeName: 'Copy',
          token: token,
        }, appId);

        return result.rows[0];
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.copyScenarioError
        };
      }
    })
    .catch(function (err) {
      if (err.message.includes('duplicate key value')) err.message = constants.scenario.scenarioNameExists;
      logger.error(appId, 'Error while copying scenario!', err);
      throw err;
    });
};

/*****
Function to delete a scenario.
*****/

Scenario.prototype.deleteScenario = function (scenarioIds, username, token, appId) {
  var promises = [];
  var ScenarioIds = scenarioIds.split(',');
  ScenarioIds.forEach(function (scenarioId) {
    promises.push(executionService.deleteScenarioData(scenarioId, username, token, appId));
  });
  promises.push(dataAccess.executeQuery(appId, util.format(queryHelper.deleteScenario, ScenarioIds.toString())));
  return Bluebird.all(promises)
    .then(function (result) {
      logger.info(appId, 'Scenario deleted successfully.');
      result.forEach((value) => {
        if (value && value.rowCount) {
          tableauService.runExtract({
            username: username,
            type: 'scenario',
            typeName: 'Delete',
            token: token,
          }, appId).then(res => logger.info(appId, 'extract status', res));
        }
      })
      return constants.scenario.deletedSuccess;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while deleting scenario!', err);
      throw err;
    });
};

/*****
Function to retrieve parameter details.
*****/

Scenario.prototype.getParameters = function (scenarioId, appId) {
  logger.info(appId, 'Getting parameters...', scenarioId);
  return dataAccess.executeQuery(appId, util.format(queryHelper.getParameters, scenarioId))
    .then(function (result) {
      logger.info(appId, 'Successfully executed query.');
      return result && result.rows ? result.rows : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error while getting parameters!', err);
      throw err;
    });
};

/********
Function to get all input tables.
********/

Scenario.prototype.getTablesByType = function (params, query, appId) {
  var executeQuery = 'SELECT ';
  if (query) executeQuery += 'acc."editable",';
  executeQuery += util.format(queryHelper.selectTables, params.scenarioId, params.tableType, params.scenarioId, params.scenarioId);
  if (query) executeQuery += 'INNER JOIN "users_table_accesses" acc ON a."id" = acc."table_id" AND acc."user_id"=' + query.userId;
  executeQuery += 'ORDER BY a."order_id";';
  logger.info(appId, 'Getting tables by type...');
  return dataAccess.executeQuery(appId, executeQuery)
    .then(function (result) {
      logger.info(appId, 'Successfully executed query.', executeQuery);
      return result.rows || [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error while getting tables by type', err);
      throw err;
    });
};

/*****
Function to get tables count.
*****/

Scenario.prototype.getResourceCount = function (params, userId, appId) {
  logger.info(appId, 'Getting resources by type...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.resourceCount, params.scenarioId, userId))
    .then(function (result) {
      logger.info(appId, 'Successfully executed query.');
      var data = {};
      if (result.rows) {
        data = result.rows.reduce((accumulator, { resource, type, count}) => {
          if (!accumulator[resource]) accumulator[resource] = {};
          accumulator[resource][type] = count;
          return accumulator;
        }, {});
      }
      return data;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while getting resources by type', err);
      throw err;
    });
};

/*****
Function to load the tables.
*****/

Scenario.prototype.loadGrid = function (queryParams, appId) {
  var gridManager = new GridManager();
  logger.info(appId, 'loading grid');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getTableInfo, queryParams.scenarioId, queryParams.tablename))
    .then(function (result) {
      if (result && result.rows && result.rows.length > 0) {
        queryParams.visiblecolumns = result.rows[0].visiblecolumns;
        queryParams.type = result.rows[0].type;
        queryParams.definition = result.rows[0].definition;
        return gridManager.createView(queryParams, appId);
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.visibleColumnsNotFound
        };
      }
    }).then(function () {
      var countQuery = gridManager.countGridQuery(queryParams);
      return dataAccess.executeQuery(appId, countQuery);
    })
    .then(function (result) {
      queryParams.countRows = result.rows[0].totalrows;
      return dataAccess.executeQuery(appId, gridManager.generateLoadGridQuery(queryParams));
    })
    .then(function (result) {
      return result && result.rows ? gridManager.generateLoadValue(result.rows, queryParams.countRows, queryParams.limit, queryParams.page) : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw {
        code: constants.httpCodes.internalServerError,
        message: constants.scenario.emptyTable,
        error: err
      };
    });
};

/*****
Function to download single table
*****/

Scenario.prototype.downloadGridData = function (queryParams, dbConfig, appId) {
  logger.info('Downloading table...');
  // Converting passed filter to the sql query format
  var filterQuery = new GridManager().getFilters(JSON.parse(queryParams.filters));

  return dataAccess.executeQuery(appId, util.format(queryHelper.getTableForDownload, queryParams.tablename,
      queryParams.type, queryParams.scenarioId, queryParams.scenarioId))
    .then(function (result) {
      if (result && result.rows && result.rows.length > 0) {
        return new GridManager().downloadTables({
            ...queryParams,
            filterQuery
          },
          result.rows, dbConfig, appId);
      } else throw constants.scenario.dataTableNameNotFound;
    });
};

/*****
Function to upload the tables.
*****/

Scenario.prototype.uploadGridData = function (scenarioId, uploadObject, username, dbConfig, token, appId) {
  var gridManager = new GridManager(),
    fileObject = {},
    query = '',
    filePath = '';
  logger.info(appId, 'Processing file to upload...', uploadObject);
  return gridManager.processUploadFile(uploadObject, appId)
    .then(function (destPath) {
      filePath = destPath;
      if (Object.keys(uploadObject).indexOf('skipHeader') >= 0 && JSON.parse(uploadObject.skipHeader) === false) {
        return gridManager.getFileColumns(destPath);
      }
      return gridManager.getColumnsFromTable(scenarioId, uploadObject.dataTableName, uploadObject.tableType, appId);
    })
    .then(function (result) {
      fileObject = {
        columns: (result.columns || result.rows[0].columnlist).replace(/,/g, '","'),
        filePath: result.filePath || filePath,
      };
      if (uploadObject.appendData === 'false') {
        query = `TRUNCATE TABLE scenario_${scenarioId}."${uploadObject.dataTableName}";`;
        return dataAccess.executeQuery(appId, query);
      }
      return;
    })
    .then(function () {
      return gridManager.copyCSVtoTable(dbConfig, uploadObject, fileObject);
    })
    .then(function () {
      logger.info(appId, 'Executing query to upload data...', fileObject.destPath);
      query = util.format(
        queryHelper.uploadGridData,
        scenarioId,
        uploadObject.dataTableName,
        uploadObject.file.name.split('/').pop(), // getting rid of the file path
        username
      );

      return dataAccess.executeQuery(appId, query);
    })
    .then(function (result) {
      tableauService.runExtract({
        username: username,
        segment: uploadObject.tableType,
        type: 'data',
        typeName: 'Data Table',
        token: token
      }, appId);
      powerbiService().refreshImports({
        username: username,
        segment: uploadObject.tableType,
        type: 'data',
        typeName: 'Data Table',
        token: token
      }, appId);
      if (result && result.rowCount === 1) {
        logger.info(appId, 'Successfully uploaded data.');
        return result.rows[0];
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.uploadDataError
        };
      }
    })
    .catch(function (err) {
      if (err.message.includes('extra data') || err.message.includes('missing data')) {
        err.message = constants.scenario.uploadTableColumnMismatch;
      }
      logger.error(appId, 'Error while uploading grid data!', err);
      throw err;
    })
    .finally(function () {
      logger.info(appId, 'From finally block of upload grid data');
      new Filer().deleteFileIfExist(filePath);
      new Filer().deleteFile(uploadObject.file.path); //deleting the file from temporary location after moving to ds/input folder
    });
};

Scenario.prototype.addGridData = function (scenarioId, tableName, newRow, type, username, token, appId) {
  return dataAccess.executeQuery(appId, util.format(
      queryHelper.addGrid,
      scenarioId,
      tableName,
      JSON.stringify(newRow).replace(new RegExp("'", 'g'), "''''"), // Converting add row data to string with escaping single quotes
      username
    ))
    .then(function () {
      //run the tableau extract task to refresh the workbook. This will run only if tableau-extract.csv file is present in ds folder
      tableauService.runExtract({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      powerbiService().refreshImports({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      return;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while adding grid data!', err);
      throw err;
    });
};

Scenario.prototype.editGridData = function (scenarioId, tableName, newRow, type, username, token, appId) {
  logger.info(appId, 'Editing grid data', scenarioId);
  return dataAccess.executeQuery(appId, util.format(
      queryHelper.editGrid,
      newRow.jqgrid_id,
      scenarioId,
      tableName,
      JSON.stringify(newRow).replace(new RegExp("'", 'g'), "''''"), // Converting edit row data to string with escaping single quotes
      username,
      false
    ))
    .then(function () {
      //run the tableau extract task to refresh the workbook. This will run only if tableau-extract.csv file is present in ds folder
      tableauService.runExtract({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      powerbiService().refreshImports({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      return constants.scenario.gridEditSuccess;
    })
    .catch(function (err) {
      if (err.message.includes('invalid input syntax')) {
        err.message = err.message.concat('. ', constants.scenario.enterCorrectDataType);
      }
      logger.error(appId, 'Error while editing grid data!', err);
      throw err;
    });
};


Scenario.prototype.editCellData = function (scenarioId, tableName, newData, type, username, token, appId) {
  var newRow = {
    jqgrid_id: newData.id,
  }
  var newRowKey = Object.keys(newData).find(function (key) {
    return key !== 'oper' && key !== 'id';
  })
  newRow[newRowKey] = newData[newRowKey];

  return dataAccess.executeQuery(appId, util.format(
      queryHelper.editGrid,
      newRow.jqgrid_id,
      scenarioId,
      tableName,
      JSON.stringify(newRow).replace(new RegExp("'", 'g'), "''''"), // Converting edit row data to string with escaping single quotes
      username,
      true
    ))
    .then(function () {
      //run the tableau extract task to refresh the workbook. This will run only if tableau-extract.csv file is present in ds folder
      tableauService.runExtract({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      powerbiService().refreshImports({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      return constants.scenario.gridEditSuccess;
    })
    .catch(function (err) {
      if (err.message.includes('invalid input syntax')) {
        err.message = err.message.concat('. ', constants.scenario.enterCorrectDataType);
      }

      logger.error(appId, 'Error while editing cell data!', err);
      throw err;
    });
};

Scenario.prototype.deleteGridData = function (scenarioId, tableName, rowsId, type, username, token, appId) {
  logger.info(appId, 'Deleting grid data', scenarioId);
  return dataAccess.executeQuery(appId, util.format(queryHelper.deleteGrid, rowsId, scenarioId, tableName, username))
    .then(function () {
      //run the tableau extract task to refresh the workbook. This will run only if tableau-extract.csv file is present in ds folder
      tableauService.runExtract({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      powerbiService().refreshImports({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      return;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while deleting grid data!', err);
      throw err;
    });
};

Scenario.prototype.tableUrl = function (scenarioId, tableType, queryParams, appId) {
  logger.info(appId, 'Getting table url...');
  var executeQuery;
  if (queryParams) {
    executeQuery = util.format(queryHelper.selectAllTableauByUser, queryParams.userId, scenarioId, tableType);
  } else {
    executeQuery = util.format(queryHelper.selectAllTableau, tableType, scenarioId);
  }
  return dataAccess.executeQuery(appId, executeQuery)
    .then(function (result) {
      return result.rows;
    }).catch(function (err) {
      logger.error(appId, 'Error in table url', err);
      throw err;
    });
};

Scenario.prototype.getHtml = function (scenarioId, appId) {
  var scriptPath = commonServices.getScriptUploadDir(appId);
  return new outputData(scriptPath).html(scenarioId);
};

Scenario.prototype.getPDF = function (scenarioId, params, appId) {
  var scriptPath = commonServices.getScriptUploadDir(appId);
  return new outputData(scriptPath).pdf(scenarioId, params);
};

Scenario.prototype.pageInfo = function (scenarioId, appId) {
  logger.info(appId, 'Getting page info...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getPageInfo, scenarioId))
    .then(function (result) {
      return result.rows;
    }).catch(function (err) {
      logger.error(appId, 'Error getting page info!', err);
      throw err;
    });
};

Scenario.prototype.changeOrderId = function (scenarioId, orderId, appId) {
  logger.info(appId, 'Changing order id...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.changeOrderId, orderId, scenarioId))
    .then(function (result) {
      return result.rows;
    }).catch(function (err) {
      logger.error(appId, 'Error while changing order id!', err);
      throw err;
    });
};

Scenario.prototype.downloadTablesByType = function (queryParams, userId, dbConfig, appId) {
  logger.info('Downloading tables...', queryParams);
  var executeQuery = '';
  queryParams.useDisplayName = JSON.parse(queryParams.useDisplayName);
  if (userId) {
    executeQuery = util.format(queryHelper.getAllTablesForDownloadByUserId,
      queryParams.useDisplayName ? 'select_query' : 'columnlist',
      queryParams.tableType, queryParams.scenarioId, queryParams.scenarioId, userId);
  } else {
    executeQuery = util.format(queryHelper.getAllTablesForDownload,
      queryParams.useDisplayName ? 'select_query' : 'columnlist',
      queryParams.tableType, queryParams.scenarioId, queryParams.scenarioId);
  }
  return dataAccess.executeQuery(appId, executeQuery)
    .then(function (result) {
      if (result && result.rows && result.rows.length > 0) {
        return new GridManager().downloadTables(queryParams, result.rows, dbConfig, appId);
      } else throw constants.scenario.dataTableNameNotFound;
    });
};

/*****
Function to save parameter.
*****/

Scenario.prototype.saveParameter = function (scenarioId, parameter, username, appId) {
  logger.info(appId, 'Saving parameter.', scenarioId);
  if (Array.isArray(parameter.value)) parameter.value = parameter.value.toString();
  return dataAccess.executeQuery(appId, util.format(queryHelper.saveParameter, scenarioId, parameter.id, parameter.value, username)) //can save only one parameter at a time
    .then(function (result) {
      if (result && result.rowCount === 1) {
        logger.info(appId, 'Successfully saved paramter.');
        return result;
      } else {
        throw constants.scenario.saveParameterError;
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error while saving parameter', err);
      throw err;
    });
};

/*****
Used to load values to the dropdown when grid column is edited
*****/

Scenario.prototype.getGridEditColumnValues = function (queryObject, appId) {
  logger.info(appId, 'Fetching grid edit column options', queryObject);
  return dataAccess.executeQuery(appId, util.format(queryHelper.getTableEditOptions, queryObject.tableName, queryObject.type))
    .then(function (result) {
      logger.info(appId, 'Fetching column values.');
      if (result && result.rows && result.rows.length > 0) {
        var gridManager = new GridManager();
        var editObject = gridManager.getKeyRow(result.rows, 'column_name', queryObject.columnName);
        var parentColumnObject = gridManager.getKeyRow(result.rows, 'column_name', editObject.parent_column_name);
        if (parentColumnObject && parentColumnObject.dependent_column_name !== '') {
          editObject.parentColumnName = parentColumnObject.dependent_column_name;
        }
        editObject.functionType = "editColumn"
        return gridManager.getDependencyValues(queryObject, editObject, appId);
      } else {
        return [];
      };
    })
    .catch(function (err) {
      logger.error(appId, 'Error while fetching column values to load!!', err);
      throw err;
    });
};

/*****
Function to get parameters List.
*****/

Scenario.prototype.getParametersList = function (scenarioObject, appId) {
  logger.info(appId, 'Executing query to get parameters list...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getParametersList, scenarioObject.scenarioId, scenarioObject.scenarioId, scenarioObject.displayName, scenarioObject.groupName)) // Get all entries for selected table.
    .then(function (result) {
      logger.info(appId, 'Successfully retrieved parameters list.')
      if (result && result.rows && result.rows.length > 0) {
        var gridManager = new GridManager(),
          editObject = result.rows[0];
        scenarioObject.parentColumnValue = editObject.value;
        editObject.functionType = "parameter"
        return gridManager.getDependencyValues(scenarioObject, editObject, appId);
      } else {
        return [];
      };
    })
    .catch(function (err) {
      logger.error(appId, 'Error getting edit options!', err);
      throw err;
    });
};


/*****
Use to get table options for grid edit
*****/

Scenario.prototype.getTableEditOptions = function (queryObject, appId) {
  logger.info(appId, 'Executing query to get table edit options...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getTableEditOptions, queryObject.tableName, queryObject.type)) // Get all entries for selected table.
    .then(function (result) {
      logger.info(appId, 'Successfully retrieved column edit options.')
      return result && result.rows && result.rows.length > 0 ? result.rows : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error getting edit options!', err);
      throw err;
    });
};

/*****
Function to get range options for each column.
*****/

Scenario.prototype.getGridRangeValues = function (scenarioObject, appId) {
  logger.info(appId, 'Executing query to get grid range values...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getRangeOptions, scenarioObject.scenarioId, scenarioObject.tableName))
    .then(function (result) {
      logger.info(appId, 'Successfully retrieved values for filter range.');
      return result && result.rows && result.rows.length === 1 && result.rows[0].columnValues ? result.rows[0].columnValues : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error getting range values!', err);
      throw err;
    });
};

/*****
Function to edit multiple rows for the tablr after filtering.
*****/

Scenario.prototype.multiEditGridData = function (scenarioId, tableName, rowsObject, type, username, token, appId) {
  rowsObject.rowsData.forEach(function (row) {
    if (row.operator &&
      row.operator !== '=' &&
      row.columnType !== 'text' &&
      row.columnType !== 'date' &&
      row.columnType !== 'timestamp' &&
      row.columnType !== 'boolean') {
      if (row.percentage) {
        row.rowValue = row.operator === '+' ? 1 + (row.rowValue / 100) : 1 - (row.rowValue / 100);
        row.operator = '*';
      }
      row.rowValue = row.operator.toString() + row.rowValue.toString();
    } else if (row.operator === '=' && row.columnType !== 'boolean') {
      row.rowValue = row.rowValue.toString();
    }
  })

  var query = util.format(
    queryHelper.multiEditGrid,
    scenarioId,
    tableName,
    rowsObject.rowsId.join(','),
    JSON.stringify(rowsObject.rowsData).replace(new RegExp("'", 'g'), "''''"), // Converting edit row data to string with escaping single quotes
    username
  );
  return dataAccess.executeQuery(appId, query)
    .then(function () {
      //run the tableau extract task to refresh the workbook. This will run only if tableau-extract.csv file is present in ds folder
      tableauService.runExtract({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      powerbiService().refreshImports({
        username: username,
        segment: type,
        type: 'data',
        typeName: 'Data Table',
        token: token,
      }, appId);
      return constants.scenario.gridEditSuccess;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while multi editing grid data!', err);
      throw err;
    });
};

/*****
Function to get the id for multi edit.
*****/

Scenario.prototype.getGridId = function (queryParams, appId) {
  var gridManager = new GridManager();
  logger.info(appId, 'Getting grid id...');
  return dataAccess.executeQuery(appId, gridManager.getGridIdQuery(queryParams))
    .then(function (result) {
      return result && result.rows && result.rows.length > 0 && result.rows[0].array ? result.rows[0].array : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/*****
Function to get all the tags.
*****/

Scenario.prototype.getTags = function (appId) {
  logger.info(appId, 'Executing query to get all the tags...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getTags))
    .then(function (result) {
      logger.info(appId, 'Successfully retrieved all the tags.')
      return result && result.rows && result.rows.length > 0 ? result.rows : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error getting range values!', err);
      throw err;
    });
};


/*****
Function to save a tag.
*****/

Scenario.prototype.saveTags = function (tagObject, userName, appId) {
  logger.info(appId, 'Executing query to save the tag...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.saveTags, tagObject.tagName, tagObject.tagType, userName))
    .then(function (result) {
      logger.info(appId, 'Successfully retrieved all the tags.')
      return result && result.rows && result.rows.length > 0 ? result.rows[0] : {};
    })
    .catch(function (err) {
      logger.error(appId, 'Error getting range values!', err);
      throw err;
    });
};

/*****
Function to upload zipped files to the  tables.
*****/

Scenario.prototype.uploadZipForGridData = function (uploadObject, dbConfig, token, appId) {
  var gridManager = new GridManager(),
    destPath = '';
  logger.info(appId, 'Processing Zip files to upload...', uploadObject.file.size);
  return gridManager.processUploadFile(uploadObject, appId)
    .then(function (unzippedPath) {
      destPath = unzippedPath;
      logger.info(appId, 'Getting all csv files from unzipped folder', unzippedPath);
      return new Filer().getAllFiles(unzippedPath);
    })
    .then(function (files) {
      if (!files || files.length === 0) {
        throw {
          code: constants.httpCodes.badRequest,
          message: constants.scenario.nofilesInZip
        };
      } else {
        logger.info(appId, 'Bulk uploading csv files.', files);
        return scenarioHelper.bulkUploadCsv(files, uploadObject, destPath, dbConfig, appId);
      }
    })
    .then(function (result) {
      tableauService.runExtract({
        username: uploadObject.username,
        type: 'data',
        typeName: 'Data Table',
        segment: uploadObject.tableType,
        token: token,
      }, appId);
      powerbiService().refreshImports({
        username: uploadObject.username,
        type: 'data',
        typeName: 'Data Table',
        segment: uploadObject.tableType,
        token: token,
      }, appId);
      logger.info(appId, 'Successfully uploaded data.');
      return result;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while uploading grid data!', err);
      throw err;
    })
    .finally(function () {
      logger.info(appId, 'From finally block of upload grid data');
      new Filer().deleteFolder(destPath);
      new Filer().deleteFile(uploadObject.file.path); //deleting the file from temporary location after moving to ds/input folder
      //run the tableau extract task to refresh the workbook. This will run only if tableau-extract.csv file is present in ds folder
    });
};

/********
 Function to get tables by template ID
 ********/

Scenario.prototype.getTemplateTables = function (queryParams, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.selectActiveTemplateTables, queryParams.templateID))
    .then(function (result) {
      logger.info(appId, 'Successfully executed query to get template tables');
      return result.rows || [];
    }).catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/*****
Function to load the row from tables.
*****/

Scenario.prototype.getRowData = function (queryParams, appId) {
  var gridManager = new GridManager();
  logger.info(appId, 'Getting row data');
  return dataAccess.executeQuery(appId, util.format(queryHelper.getTableInfo, queryParams.scenarioId, queryParams.tablename))
    .then(function (result) {
      if (result && result.rows && result.rows.length > 0) {
        queryParams.visiblecolumns = result.rows[0].visiblecolumns;
        queryParams.type = result.rows[0].type;
        queryParams.definition = result.rows[0].definition;
        return gridManager.createView(queryParams, appId);
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.visibleColumnsNotFound
        };
      }
    })
    .then(function (result) {
      var query = gridManager.generateLoadGridQuery(queryParams);
      return dataAccess.executeQuery(appId, query);
    })
    .then(function (result) {
      return result && result.rows && result.rows.length ? result.rows[0] : {};
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw {
        code: constants.httpCodes.internalServerError,
        message: constants.scenario.emptyTable,
        error: err
      };
    });
};

/*****
Function to load filter values for columns.
*****/

Scenario.prototype.getRowFilter = function (queryParams, appId) {
  var gridManager = new GridManager();
  logger.info(appId, 'Getting row filter...');
  var countQuery = gridManager.countGridQuery(queryParams);
  return dataAccess.executeQuery(appId, countQuery)
    .then(function (result) {
      queryParams.countRows = result.rows[0].totalrows;
      return dataAccess.executeQuery(appId, gridManager.generateLoadGridQuery(queryParams));
    })
    .then(function (result) {
      return result && result.rows ? {
        totalrows: queryParams.countRows,
        result: result.rows
      } : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw {
        code: constants.httpCodes.internalServerError,
        message: constants.scenario.emptyTable,
        error: err
      };
    });
};


/*****
 Getting input tables and parameters updated since the last execution of the primary script
 *****/

Scenario.prototype.getUpdatedInputsParameters = function (queryParams, token, appId) {
  logger.info(appId, 'Getting input tables and parameters updated since the last execution of the primary script');

  return Bluebird.all([
    dataAccess.executeQuery(appId, util.format(queryHelper.selectUpdatedInputsParameters, queryParams.scenarioId)),
    enframeManager.getActions(appId, {}, token)
  ]).then(function (result) {
    var primaryAction = result[1].filter(function (action) {
      return action.type === 'primary';
    })[0];
    var inputs = result[0].rows.find(function (row) {
      return row.tab_name === 'inputs';
    });
    var parameters = result[0].rows.find(function (row) {
      return row.tab_name === 'parameters';
    });

    return {
      inputs: inputs && inputs.values.length > 0 ? inputs.values.filter(function (input) {
        return input.input_updated_at &&
          primaryAction &&
          primaryAction.lastAccessedAt &&
          Math.floor(Date.parse(input.input_updated_at) / 1000) > Math.floor(Date.parse(primaryAction.lastAccessedAt) / 1000);
      }) : [],
      parameters: parameters && parameters.values.length > 0 ? parameters.values.filter(function (parameter) {
        return parameter.parameter_updated_at &&
          primaryAction &&
          primaryAction.lastAccessedAt &&
          Date.parse(parameter.parameter_updated_at) > Date.parse(primaryAction.lastAccessedAt);
      }) : [],
    };
  }).catch(function (err) {
    logger.error(appId, 'Error executing query to get input tables and parameters updated since the last execution', err);
    throw err;
  });
}

/******
 Function to spin up jupyter notebook container.
 */
Scenario.prototype.openNotebook = function (executionId, scenarioId, token, appId) {
  logger.info(appId, 'Opening notebook.', scenarioId);
  return notebookManager.openNotebook(appId, executionId, scenarioId, token)
    .catch(function (err) {
      logger.error(appId, constants.notebooks.openNotebookError, err);
      throw err;
    });
};

Scenario.prototype.removeNotebook = function (token, appId) {
  logger.info(appId, 'Removing notebook.', );
  return notebookManager.removeNotebook(appId, token)
    .catch(function (err) {
      logger.error(appId, 'Removing notebook', err);
      throw err;
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

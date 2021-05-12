var util = require('util'),
  Bluebird = require('bluebird');

var logger = require('../../logger'),
  dataAccess = require('../../dataAccess/postgres'),
  TableauManager = require('./tableauManager'),
  queryHelper = require('./queryHelper'),
  constants = require('../../common/constants'),
  CommonServices = require('../commonServices'),
  settingService = require('../setting').getInstance(),
  enframeManager = require('../enframeManager');

var _instance;

var Tableau = function () {};

/*****
It generates the ticket by reading tableau-extract.json file from ds
username, tableauServer object should be present in the json file
{
  "username": "tableauuser",
  "tableauServer": "http://reports.opexanalytics.com/trusted"
}
*****/

Tableau.prototype.getTicket = function (appId) {
  return settingService.getSettings({
      keys: 'tableauTrusted,tableauUsername'
    }, appId)
    .then(function (result) {
      if (result && result.tableauTrusted && result.tableauUsername) {
        if (result.tableauTrusted) {
          if (result.tableauUsername && result.tableauUsername !== '') {
            return new TableauManager().generateTicket(result.tableauUsername, appId);
          } else {
            throw {
              code: constants.httpCodes.notFound,
              message: constants.tableau.usernotFound
            };
          }
        } else {
          return {
            tableauTrusted: false
          };
        }
      } else {
        return {
          tableauTrusted: false
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error while generating trusted ticket for tableau!!!', err);
      throw err;
    });
};


/*****
This method is used run the extract API task. It reads the tableu config from tableau-extract.json file from ds.
{
  "workbooks": [
    {
      "workbook": "output_forecast_inventory_report_v1",
      "project": "Default"
    },
    {
      "workbook": "output_forecast_inventory_report_v1",
      "project": "Default"
    }
  ],
  "extractAPI": "http://reports.opexanalytics.com:8002/execute?project=%s&workbook=%s",
  "authKey": "WKuxMkls056p+0v6MWmILCSlgnt+tU7qTh7iNTsg/Qs="
}
It makes api call to server-wrapper for tableau extract task (http://reports.opexanalytics.com:8002/execute?project=%s&workbook=%s) and runs the extract for multiple workbooks.
*****/

Tableau.prototype.runExtract = function (extractObject, appId) {
  logger.info(appId, 'Running Tableau Extract!', extractObject);
  var settingObject = {};
  if (extractObject.type) settingObject.type = extractObject.type;
  if (extractObject.typeName) settingObject.typeName = extractObject.typeName;
  if (extractObject.typeId) settingObject.typeId = extractObject.typeId;
  if (extractObject.segment) settingObject.segment = extractObject.segment;
  if (extractObject.token) settingObject.token = extractObject.token;
  
  return this.getExtractSetting(settingObject, appId)
  .then(function (result) {
    if (result && result.length > 0 && result.some((ele) => ele.runExtract)) {
      var promise = extractObject.jobId ? new TableauManager().runTableauExtractForExecution(extractObject) : new TableauManager().runTableauExtract(extractObject, appId);
      return promise.then(function (result) {
        result.tableauExtract = true;
        return result;
      });
    } else {
      return {
        tableauExtract: false
      };
    }
  })
  .catch(function (err) {
    logger.error(appId, 'Error while running tableau extract!!!', err);
    throw err;
  });
};

/*****
connects to tableau server and fetches all workbooks and projects
*****/

Tableau.prototype.getAllWorkbooks = function (appId) {
  logger.info(appId, 'Fetching all workbooks.');
  return new TableauManager().getAllWorkbooks();
};

/*****
connects to tableau server and fetches all users
*****/

Tableau.prototype.getAllUsers = function (appId) {
  logger.info(appId, 'Fetching all users.');
  return new TableauManager().getAllUsers();
};


/*****
Function to retrieve the current tableau setings which include the links to tableau input and output.
*****/

Tableau.prototype.getTableau = function (queryObject, appId) {
  logger.info(appId, 'Executing query...');
  var getTableauQuery = queryHelper.getTableau;
  if (queryObject.scenario_template_id) getTableauQuery += ' WHERE r."scenario_template_id"=' + queryObject.scenario_template_id;
  if (queryObject.userId) {
    getTableauQuery += ' INNER JOIN "users_visualization_accesses" acc ON r.id = acc."report_id" AND acc."user_id"=' +
      queryObject.userId;
  }
  getTableauQuery += ' ORDER BY r."order_id";';

  return dataAccess.executeQuery(appId, getTableauQuery)
    .then(function (result) {
      logger.info(appId, 'Successfully executed query.');
      return result && result.rows ? result.rows : [];
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', {
        error: err
      });
      throw err;
    });
};

/*****
Function to unlink the current tableau links with the app.
*****/

Tableau.prototype.deleteTableau = function (tableauId, appId) {
  logger.info(appId, 'Executing query...');
  return dataAccess.executeQuery(appId, util.format(queryHelper.deleteTableau, tableauId))
    .then(function (result) {
      logger.info(appId, 'Successfully deleted tableau.');
      if (result && result.rows) {
        return constants.tableau.deleteSuccess;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.tableau.deleteTableauError
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/*****
Function to edit the tableau settings which includes the url, label and id.
*****/

Tableau.prototype.editTableau = function (tableauId, tableau, userName, appId) {
  var query = util.format(queryHelper.editTableau, tableau.scenario_template_id, tableau.url, tableau.label, userName);
  if (tableau.project) {
    query += util.format(', "project"=\'%s\', "workbook"=\'%s\'', tableau.project, tableau.workbook);
  }
  query += ' WHERE "id"=' + tableauId + ';';
  return dataAccess.executeQuery(appId, query)
    .then(function (result) {
      if (result && result.rowCount === 1) {
        return constants.tableau.updateSuccess;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.tableau.editTableauError
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error updating tableau workbook', err);
      throw err;
    });
};

/*****
Function to add tableau links.
*****/

Tableau.prototype.addTableau = function (tableau, userName, appId) {
  var query;

  if (tableau.project) {
    query = util.format(queryHelper.addTableauWithProject, tableau.scenario_template_id, tableau.url, tableau.label, tableau.type, userName, userName, tableau.project, tableau.workbook);
  } else {
    query = util.format(queryHelper.addTableau, tableau.scenario_template_id, tableau.url, tableau.label, tableau.type, userName, userName);
  }
  return dataAccess.executeQuery(appId, query)
    .then(function (result) {
      if (result && result.rowCount === 1) {
        return result.rows[0];
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.tableau.addTableauError
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error Adding tableau workbook!', err);
      throw err;
    });
};

/*****
Function to update tableau order.
*****/

Tableau.prototype.changeOrderId = function (tableauId, orderId, appId) {
  var condition = '"id" = ' + tableauId;
  return new CommonServices().updateTable('lkp_tableau_report', 'order_id', orderId, condition, appId)
    .then(function (result) {
      return result.rows;
    })
    .catch(function (err) {
      logger.error(appId, 'Error Updating order of reports', err);
      throw new Error(err);
    });
};


/*****
getting tableau extract settings
*****/

Tableau.prototype.getExtractSetting = function (settingObject, appId) {
  var condition = [];
  var query = queryHelper.getExtractSetting;
  if (settingObject.id) condition.push('te."id="' + settingObject.id);
  if (settingObject.typeId) condition.push('te."typeId"=\'' + settingObject.typeId + '\'');
  if (settingObject.segment) condition.push('te."segment"=\'' + settingObject.segment + '\'');
  if (settingObject.type) condition.push('te."type"=\'' + settingObject.type + '\'');
  if (settingObject.typeName) condition.push('te."typeName"=\'' + settingObject.typeName + '\'');
  if (condition.length > 0) query += ' WHERE ' + condition.join(' AND ');
  logger.info(appId, 'Getting extract setting for query', query);

  return dataAccess.executeQuery(appId, query)
    .then(function (result) {
      return result && result.rows ? result.rows : [];
    });
};

// Refresh extract settings before fetching them for UI
Tableau.prototype.getUpdatedExtractSetting = function (settingObject, token, appId) {
  var self = this;
  return this.refreshExtractSettings(settingObject.username, token, appId)
    .then(function () {
      return self.getExtractSetting(settingObject, appId);
    });
}

/*****
update tableau extract setting object based on id
*****/

Tableau.prototype.updateExtractSetting = function (extractSettingObject, appId) {
  var setValues = [],
    condition = [];
  if (Object.keys(extractSettingObject).indexOf('runExtract') > -1) setValues.push('"runExtract"=' + extractSettingObject.runExtract);
  if (extractSettingObject.segment) setValues.push('"segment"=\'' + extractSettingObject.segment + '\'');
  if (extractSettingObject.typeName) setValues.push('"typeName"=\'' + extractSettingObject.typeName + '\'');
  if (extractSettingObject.typeId) setValues.push('"typeId"=\'' + extractSettingObject.typeId + '\'');
  if (extractSettingObject.type) setValues.push('"type"=\'' + extractSettingObject.type + '\'');
  setValues.push('"updatedBy"=\'' + extractSettingObject.username + '\'');
  setValues.push('"updatedAt"=now()');
  if (extractSettingObject.id) condition.push('"id"=' + extractSettingObject.id);
  else if (extractSettingObject.typeId) condition.push('"typeId"=\'' + extractSettingObject.typeId + '\'');
  var query = util.format(queryHelper.updateExtractSetting, setValues.join(','));
  if (condition.length > 0) query += ' WHERE ' + condition.join(' AND ');
  logger.info(appId, 'updating extract setting', query);
  return dataAccess.executeQuery(appId, query)
    .then(function (result) {
      if (result && result.rowCount === 1) {
        return constants.tableau.tableauExtractSettingUpdateSuccess;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.tableau.errorTableauExtractSetting
        };
      }
    });
};

/*****
insert tableau extract setting
*****/

Tableau.prototype.insertExtractSetting = function (extractSettingObject, appId) {
  var columnNames = [],
    columnValues = [];
  columnNames.push('"type"');
  columnValues.push('\'' + extractSettingObject.type + '\'');
  columnNames.push('"runExtract"');
  columnValues.push(false);
  columnNames.push('"createdBy"');
  columnValues.push('\'' + extractSettingObject.username + '\'');
  columnNames.push('"updatedBy"');
  columnValues.push('\'' + extractSettingObject.username + '\'');
  if (extractSettingObject.typeId) {
    columnNames.push('"typeId"');
    columnValues.push('\'' + extractSettingObject.typeId + '\'');
  }
  if (extractSettingObject.typeName) {
    columnNames.push('"typeName"');
    columnValues.push('\'' + extractSettingObject.typeName + '\'');
  }
  if (extractSettingObject.segment) {
    columnNames.push('"segment"');
    columnValues.push('\'' + extractSettingObject.segment + '\'');
  }
  logger.info(appId, 'inserting extract setting');
  return dataAccess.executeQuery(appId, util.format(queryHelper.insertExtractSetting, columnNames.join(','), columnValues.join(',')))
    .then(function (result) {
      if (result && result.rowCount === 1) {
        return constants.tableau.tableauExtractSettingUpdateSuccess;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.tableau.errorTableauExtractSetting
        };
      }
    });
};


/*****
deleting extract setting using type id
*****/

Tableau.prototype.deleteExtractSetting = function (id, appId) {
  logger.info(appId, 'deleting extract setting using id', id);
  return dataAccess.executeQuery(appId, util.format(queryHelper.deleteExtractSetting, id));
};

Tableau.prototype.refreshExtractSettings = function (username, token, appId) {
  var self = this;
  return Bluebird.all([
    enframeManager.getActions(appId, {}, token),
    dataAccess.executeQuery(appId, queryHelper.getExtractSetting),
  ]).then(function (results) {
    var actions = results[0];
    var extractSettings = results[1].rows;
    var promises = [];
    actions.forEach(function (action) {
      if (action.type === 'secondary') {
        var existingSetting = extractSettings.find(function (setting) { return setting.typeId === action._id; });
        if (!existingSetting) {
          promises.push(self.insertExtractSetting({
            type: 'action',
            username: username,
            typeId: action._id,
            typeName: action.name,
            segment: action.segment,
          }, appId));
        }
      } else if (action.type === 'primary') {
        var existingSetting = extractSettings.find(function (setting) { return setting.type === 'script'; });
        promises.push(self.updateExtractSetting({
          id: existingSetting.id,
          typeId: action._id,
          username: username,
        }, appId));
      }
    });

    extractSettings.forEach(function (setting) {
      if (setting.type === 'action') {
        var existingAction = actions.find(function (action) { return action._id === setting.typeId; });
        if (!existingAction) {
          promises.push(self.deleteExtractSetting(setting.id, appId));
        } else if (setting.typeName !== existingAction.name) {
          promises.push(self.updateExtractSetting({
            id: setting.id,
            typeId: existingAction._id,
            typeName: existingAction.name,
            segment: existingAction.segment,
            username: username,
          }, appId));
        }
      }
    });
    return Bluebird.all(promises);
  });
}

Tableau.prototype.getReportsUserData = function (appData) {
  return {
    server: appData.database.serverName,
    port: appData.database.port.toString(),
    dbname: appData.database.databaseName,
    username: appData.reports ? appData.reports.dbUsername : appData.database.roles.readOnly.dbusername,
    password: appData.reports ? appData.reports.dbPassword : appData.database.roles.readOnly.dbpassword
  };
}

Tableau.prototype.getProjectId = async function (projectName) {
  return await new TableauManager().getProjectId(projectName);
}

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Tableau();
    }
    return _instance;
  }
};

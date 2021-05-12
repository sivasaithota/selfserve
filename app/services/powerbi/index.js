var util = require('util'),
  Bluebird = require('bluebird');

var constants = require('../../common/constants'),
  logger = require('../../logger'),
  dataAccess = require('../../dataAccess/postgres'),
  mongoClient = require('../../dataAccess/mongo'),
  CommonServices = require('../commonServices'),
  PowerBiManager = require('./powerbiManager'),
  queryHelper = require('./queryHelper'),
  enframeManager = require('../enframeManager');

/**
 * PowerBi Service
 */
var PowerBi = function () {

  /**
   * Get embed url for reports
   * @param {*} type report type
   */
var getEmbedUrls = function (scenarioId, type, userId, appId) {
  var getPowerBIQuery = queryHelper.getReportsByScenario;
    if (userId) {
      var joinPart = ' INNER JOIN "users_powerbi_accesses" acc ON lkp_powerbi_report.id = acc."powerbi_id" AND acc."user_id"=' + userId + ' %s';
      getPowerBIQuery = util.format(getPowerBIQuery, joinPart);
    }
    var conditionAndOrder = util.format(' WHERE "type"=\'%s\' AND "projects"."id"=%s ORDER BY "order_id";', type, scenarioId);
    var query = util.format(getPowerBIQuery, conditionAndOrder);
    logger.info(appId, 'Fetch embed urls for powerbi');
    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        if (result && result.rowCount > 0) {
          var promises = [];

          result.rows.forEach(function (row) {
            if (row.report_type === 'report') {
              promises.push(PowerBiManager().getEmbedTokenForReport(row.workspace_id, row.report_id));
            } else if (row.report_type === 'dashboard') {
              promises.push(PowerBiManager().getEmbedTokenForDashboard(row.workspace_id, row.report_id));
            }
          });

          return Promise.all(promises)
            .then(function (tokenResponses) {
              result.rows.forEach(function (row) {
                row.token = tokenResponses.find(function (t) {
                  return t.reportId === row.report_id;
                }).token;
              });

              return result.rows;
            });
        } else return [];
      });
  }

  /**
   * Get reports
   */
  var getReports = function (parameters, appId) {
    var getPowerBIQuery = queryHelper.getReports;
    if (parameters.scenarioTemplateId) getPowerBIQuery += ' WHERE r."scenario_template_id"=' + parameters.scenarioTemplateId;
    if (parameters.userId) {
      getPowerBIQuery += ' INNER JOIN "users_powerbi_accesses" acc ON r.id = acc."powerbi_id" AND acc."user_id"=' +
        parameters.userId;
    }
    getPowerBIQuery += ' ORDER BY r."order_id";';
    return dataAccess.executeQuery(appId, getPowerBIQuery)
      .then(function (result) {
        return result && result.rowCount > 0 ? result.rows : [];
      })
      .catch(function (err) {
        logger.error(appId, 'Error fetching powerbi report', err);
        throw err;
      });
  }

  /**
   * Edit report in database and update configuration. Before editing the report, verify the report details with powerbi service
   * @param {*} requestObject
   * @param {*} userName
   */
  var editReport = function (id, requestObject, userName, appId) {
    var url = new URL(requestObject.url);

    if (url.hostname.indexOf('powerbi.com') === -1 && url.pathname.indexOf('groups') === -1) {
      throw {
        code: constants.httpCodes.badRequest,
        message: constants.powerbi.invalidUrl
      };
    }

    var params = url.pathname;
    var workspaceId = params.split('groups/')[1].split('/')[0];
    var reportType, reportId;

    if (params.indexOf('dashboards') !== -1) {
      reportType = 'dashboard';
      reportId = params.split('dashboards/')[1].split('/')[0];
    } else if (params.indexOf('reports') !== -1) {
      reportType = 'report';
      reportId = params.split('reports/')[1].split('/')[0].split('?')[0];
    } else {
      throw {
        code: constants.httpCodes.badRequest,
        message: constants.powerbi.invalidUrl
      };
    }

    return dataAccess.executeQuery(
        appId,
        util.format(queryHelper.editReport,
          requestObject.scenario_template_id,
          url,
          reportType,
          workspaceId,
          reportId,
          requestObject.label,
          userName,
          id
        )
      )
      .then(function (result) {
        if (result && result.rowCount === 1) {
          logger.info(appId, 'Successfully edited powerbi report');
          return constants.powerbi.editReportSuccess;
        } else {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.powerbi.editReportError
          };
        }
      })
      .catch(function (err) {
        logger.error(appId, 'Error editing powerbi report', err);
        throw err;
      });
  }

  /**
   * Add report to database and update configuration. Before adding the report, verify the report details with powerbi service
   * @param {*} reportId
   */
  var deleteReport = function (reportId, appId) {
    return dataAccess.executeQuery(appId, util.format(queryHelper.deleteReport, reportId))
      .then(function (result) {
        if (result && result.rowCount === 1) {
          logger.info(appId, 'Successfully deleted powerbi report');
          return constants.powerbi.deleteReportSuccess;
        } else {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.powerbi.deleteReportError
          };
        }
      })
      .catch(function (err) {
        logger.error(appId, 'Error deleting powerbi report', err);
        throw err;
      });

  }

  /**
   * Add report to database and update configuration. Before adding the report, verify the report details with powerbi service
   * @param {*} requestObject
   * @param {*} userName
   */
  var addReport = function (requestObject, userName, appId) {
    var url = new URL(requestObject.url);

    if (url.hostname.indexOf('powerbi.com') === -1 || url.pathname.indexOf('groups') === -1) {
      throw {
        code: constants.httpCodes.badRequest,
        message: constants.powerbi.invalidUrl
      };
    }

    var params = url.pathname;
    var workspaceId = params.split('groups/')[1].split('/')[0];
    var reportType, reportId, insertResult;

    if (params.indexOf('dashboards') !== -1) {
      reportType = 'dashboard';
      reportId = params.split('dashboards/')[1].split('/')[0];
    } else if (params.indexOf('reports') !== -1) {
      reportType = 'report';
      reportId = params.split('reports/')[1].split('/')[0].split('?')[0];
    } else {
      throw {
        code: constants.httpCodes.badRequest,
        message: constants.powerbi.invalidUrl
      };
    }

    return dataAccess.executeQuery(
        appId,
        util.format(queryHelper.addReport,
          requestObject.scenario_template_id,
          url,
          reportType,
          workspaceId,
          reportId,
          requestObject.label,
          requestObject.type,
          userName,
          userName
        )
      ).then(function (result) {
        if (result && result.rowCount === 1) {
          insertResult = result.rows[0];
          logger.info(appId, 'Successfully added powerbi report');
          return insertResult;
        } else {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.powerbi.addReportError
          };
        }
      })
      .catch(function (err) {
        logger.error(appId, 'Error executing add powerbi report query', err);
        throw err;
      });
  }

  /**
   * Update order id
   * @param {*} powerbiId
   * @param {*} orderId
   */
  var changeOrderId = function (powerbiId, orderId, appId) {
    logger.info(appId, 'Executing query to update powerbi report order id...');
    var condition = '"id" = ' + powerbiId;
    return new CommonServices().updateTable('lkp_powerbi_report', 'order_id', orderId, condition, appId)
      .then(function (result) {
        return result.rows;
      })
      .catch(function (err) {
        logger.error(appId, 'Error updating report id', err);
        throw err;
      });
  };

  var refreshImportSettings = function (username, token, appId) {
    return Bluebird.all([
      enframeManager.getActions(appId, {}, token),
      dataAccess.executeQuery(appId, queryHelper.getImportSetting),
    ]).then(function (results) {
      var actions = results[0];
      var importSettings = results[1].rows;
      var promises = [];
      actions.forEach(function (action) {
        if (action.type === 'secondary') {
          var existingSetting = importSettings.find(function (setting) {
            return setting.type_id === action._id;
          });
          if (!existingSetting) {
            promises.push(addImportSetting({
              type: 'action',
              username: username,
              typeId: action._id,
              typeName: action.name,
              segment: action.segment,
            }, appId));
          }
        } else if (action.type === 'primary') {
          var existingSetting = importSettings.find(function (setting) {
            return setting.type === 'script';
          });
          promises.push(updateImportSetting({
            id: existingSetting.id,
            typeId: action._id,
            username: username,
          }, appId));
        }
      });

      importSettings.forEach(function (setting) {
        if (setting.type === 'action') {
          var existingAction = actions.find(function (action) {
            return action._id === setting.type_id;
          });
          if (!existingAction) {
            promises.push(deleteImportSetting(setting.id, appId));
          } else if (setting.type_name !== existingAction.name) {
            promises.push(updateImportSetting({
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

  /**
   * Add import settings
   * @param {*} importSettingObject
   */
  var addImportSetting = function (importSettingObject, appId) {
    var columnNames = [];
    var columnValues = [];

    columnNames.push('"type"');
    columnValues.push('\'' + importSettingObject.type + '\'');
    columnNames.push('"run_import"');
    columnValues.push(false);
    columnNames.push('"created_by"');
    columnValues.push('\'' + importSettingObject.username + '\'');
    columnNames.push('"updated_by"');
    columnValues.push('\'' + importSettingObject.username + '\'');
    if (importSettingObject.typeId) {
      columnNames.push('"type_id"');
      columnValues.push('\'' + importSettingObject.typeId + '\'');
    }
    if (importSettingObject.typeName) {
      columnNames.push('"type_name"');
      columnValues.push('\'' + importSettingObject.typeName + '\'');
    }
    if (importSettingObject.segment) {
      columnNames.push('"segment"');
      columnValues.push('\'' + importSettingObject.segment + '\'');
    }

    logger.info(appId, 'inserting powerbi import setting');

    return dataAccess.executeQuery(appId, util.format(queryHelper.insertImportSetting, columnNames.join(','), columnValues.join(',')))
      .then(function (result) {
        if (result && result.rowCount === 1) {
          return constants.powerbi.saveImportSettingsSuccess;
        } else {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.powerbi.saveImportSettinssError
          };
        }
      });
  }

  /**
   * Get import settings
   * @param {*} settingObject
   */
  var getImportSettings = function (settingObject, appId) {
    var condition = [];
    var query = queryHelper.getImportSetting;

    if (settingObject.id) condition.push('powerbi_import_settings."id="' + settingObject.id);
    if (settingObject.typeId) condition.push('powerbi_import_settings."type_id"=\'' + settingObject.typeId + '\'');
    if (settingObject.segment) condition.push('powerbi_import_settings."segment"=\'' + settingObject.segment + '\'');
    if (settingObject.type) condition.push('powerbi_import_settings."type"=\'' + settingObject.type + '\'');
    if (settingObject.typeName) condition.push('powerbi_import_settings."type_name"=\'' + settingObject.typeName + '\'');
    if (condition.length > 0) query += ' WHERE ' + condition.join(' AND ');

    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        return result && result.rows ? result.rows : [];
      })
      .catch(function (err) {
        logger.error(appId, 'Error fetching powerbi report', err);
        throw {
          code: constants.httpCodes.internalServerError,
          error: constants.powerbi.getImportSettingsError
        }
      });
  }

  /**
   * Get updated setings
   * @param {*} settingObject 
   */
  var getUpdatedImportSettings = function (settingObject, token, appId, ) {
    return refreshImportSettings(settingObject.username, token, appId)
      .then(function () {
        return getImportSettings(settingObject, appId);
      })
  }

  /**
   * Update import settings
   * @param {*} importSettingObject
   */
  var updateImportSetting = function (importSettingObject, appId) {
    var setValues = [];
    var condition = [];

    if (Object.keys(importSettingObject).indexOf('runImport') > -1) setValues.push('"run_import"=' + importSettingObject.runImport);
    if (importSettingObject.segment) setValues.push('"segment"=\'' + importSettingObject.segment + '\'');
    if (importSettingObject.typeName) setValues.push('"type_name"=\'' + importSettingObject.typeName + '\'');
    if (importSettingObject.typeId) setValues.push('"type_id"=\'' + importSettingObject.typeId + '\'');
    if (importSettingObject.type) setValues.push('"type"=\'' + importSettingObject.type + '\'');

    setValues.push('"updated_by"=\'' + importSettingObject.username + '\'');
    setValues.push('"updated_at"=now()');

    if (importSettingObject.id) condition.push('"id"=' + importSettingObject.id);
    else if (importSettingObject.typeId) condition.push('"type_id"=\'' + importSettingObject.typeId + '\'');

    var query = util.format(queryHelper.updateImportSetting, setValues.join(','));
    if (condition.length > 0) query += ' WHERE ' + condition.join(' AND ');

    logger.info(appId, 'updating powerbi import setting', query);
    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        if (result && result.rowCount === 1) {
          return constants.powerbi.saveImportSettingsSuccess;
        } else {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.powerbi.saveImportSettinssError
          };
        }
      });
  };

  /**
   * Refresh datasets
   * @param {*} importObject
   */
  var refreshImports = function (importObject, appId) {
    logger.info(appId, 'Running powerbi import', importObject);
    var settingObject = {};
    var startTime = new Date();

    if (importObject.type) settingObject.type = importObject.type;
    if (importObject.typeName) settingObject.typeName = importObject.typeName;
    if (importObject.typeId) settingObject.typeId = importObject.typeId;
    if (importObject.segment) settingObject.segment = importObject.segment;
    if (importObject.token) settingObject.token = importObject.token;   

    getImportSettings(settingObject, appId)
      .then(function (settingsResult) {
        if (settingsResult && settingsResult.length === 1 && settingsResult[0].run_import) {
          if (importObject.jobId) _updateLogs({
            jobId: importObject.jobId,
            status: 'Publishing Reports',
            log: constants.powerbi.runningRefreshStatus
          });
          refreshDatasets(appId)
            .then(function () {
              logger.info(appId, 'Powerbi import refresh completed');
              return importObject.jobId ? _updateLogs({
                jobId: importObject.jobId,
                startTime: startTime,
                status: constants.powerbi.refreshDoneStatus,
                log: constants.powerbi.refreshDoneMessage
              }) : '';
            })
            .catch(function (error) {
              logger.error(appId, 'Failed to refresh reports ', error);
              if (importObject.jobId) _updateLogs({
                jobId: importObject.jobId,
                startTime: startTime,
                status: constants.powerbi.refreshFailedStatus,
                log: error
              });
            });
        }
      });
  }

  /**
   * Refresh datasets of all reports
   * @param {*} appId 
   */
  var refreshDatasets = function (appId) {
    var condition = '';
    var query = util.format(queryHelper.getReportsForRefresh, condition);
    return dataAccess.executeQuery(appId, query)
      .then(function (results) {
        return results && results.rowCount > 0 ? _refresh(results.rows) : '';
      });
  }

  /**
   * Delete setting
   * @param {*} id
   * @param {*} appId
   */
  var deleteImportSetting = function (id, appId) {
    logger.info(appId, 'deleting extract setting using id', id);
    return dataAccess.executeQuery(appId, util.format(queryHelper.deleteImportSetting, id));
  }

  /**
   * Refresh helper. Collects all unique datasets in all reports and dashboards and sends refresh request to all of them
   * @param {*} rows
   */
  var _refresh = function (rows) {
    return Bluebird.map(rows, function (row) {
        return PowerBiManager().getDataset(row.workspace_id, row.report_id, row.report_type);
      })
      .then(function (datasets) {
        var promises = [];
        _filterUniqueDatasets(datasets).map(dataset => promises.push(_refreshDataSet(dataset)));
        return Bluebird.all(promises);
      });
  };

  var _refreshDataSet = function (dataset) {
    return PowerBiManager().sendRefreshRequestForDataset(dataset.workspaceId, dataset.datasetId)
      .then(function () {
        return _pollRefreshStatus(dataset);
      })
  };

  /**
   * Poll every 3 seconds for refresh status
   * @param {*} dataset
   */
  var _pollRefreshStatus = function (dataset) {
    function checkStatus(resolve, reject) {
      return PowerBiManager().checkRefreshStatus(dataset.workspaceId, dataset.datasetId)
        .then(function (response) {
          logger.info('common', `Dataset ${dataset.datasetId} refresh status : ${response.value[0].status}`);
          if (response.value[0].status === "Completed") resolve();
          else if (response.value[0].status === "Failed") {
            logger.error('common', 'Failed to refresh powerbi reports', response.value[0]);
            if (response.value[0].serviceExceptionJson) {
              var errorCode = JSON.parse(response.value[0].serviceExceptionJson).errorCode;
              if (errorCode === 'ModelRefreshFailed_CredentialsNotSpecified')
                reject(constants.powerbi.invalidCredentialsError);
              else
                reject(constants.powerbi.refreshFailedMessage);
            }
            reject(constants.powerbi.refreshFailedMessage);
          } else setTimeout(checkStatus, 3000, resolve, reject);
        });
    }

    return new Promise(checkStatus);
  }

  var _filterUniqueDatasets = function (datasets) {
    var uniqueDatasets = new Set();
    datasets.filter(function (dataset) {
      if (!uniqueDatasets.has(dataset.datasetId)) {
        uniqueDatasets.add(dataset.datasetId);
        return true;
      }
      return false;
    });
    return datasets;
  }

  var _updateLogs = function (logData) {
    var {
      jobId,
      startTime,
      status,
      log
    } = logData;

    mongoClient.findOne(constants.dbConstants.databases.fluentD, 'logStatus', {
        _id: mongoClient.getObjectId(jobId)
      })
      .then(function (jobData) {
        jobData.status = status;
        if (startTime) {
          jobData.endTime = new Date();
          jobData.executionTime += Math.round((jobData.endTime - startTime) / 1000);
        }
        mongoClient.save(constants.dbConstants.databases.fluentD, 'logStatus', jobData);
        mongoClient.save(constants.dbConstants.databases.fluentD, 'logs', {
          container_name: '/' + jobData.jobId,
          "log": '#businesslog ' + log,
          "time": new Date()
        });
      });
  }

  return {
    getEmbedUrls,
    addReport,
    getReports,
    editReport,
    deleteReport,
    changeOrderId,
    addImportSetting,
    updateImportSetting,
    getImportSettings,
    getUpdatedImportSettings,
    refreshDatasets,
    refreshImports,
    deleteImportSetting
  };
}

module.exports = PowerBi;

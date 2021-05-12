var util = require('util'),
  queryHelper = require('./queryHelper'),
  constants = require('../../common/constants');

var config = require('config'),
  dataAccess = require('../../dataAccess/postgres'),
  mongoClient = require('../../dataAccess/mongo'),
  logger = require('../../logger');

var CommonServices = function () {};

CommonServices.prototype.convertSettingArrayToObject = function (result) {
  var settingObject = {};
  if (result && result.rows && result.rows.length > 0) {
    for (var irow = 0; irow < result.rows.length; irow++) {
      switch (result.rows[irow].data_type) {
        case 'integer':
          settingObject[result.rows[irow].key] = parseInt(result.rows[irow].value);
          break;
        case 'boolean':
          settingObject[result.rows[irow].key] = JSON.parse(result.rows[irow].value);
          break;
        default:
          settingObject[result.rows[irow].key] = result.rows[irow].value;
          break;
      }
    }
  }
  return settingObject;
};

/*****
Function to update table.
*****/
CommonServices.prototype.updateTable = function (tableName, columnList, values, condition, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.updateTable, tableName, columnList, values, condition))
    .then(function (result) {
      logger.debug(appId, 'Updating table...');
      return result;
    })
    .catch(function (err) {
      logger.error(appId, 'Error updating table!', err);
      throw err;
    });
};

/*****
Function to sanitize uploaded file name
*****/
CommonServices.prototype.sanitizeFilename = function (filename) {
  return filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
}

CommonServices.prototype.getGlobalSettings = function (key) {
  return mongoClient.findOne(constants.dbConstants.databases.enframe, constants.dbConstants.collections.settings, {}, {
      '_id': 0
    })
    .then(function (result) {
      return result[key];
    });
};

CommonServices.prototype.getScriptUploadDir = function (appId) {
  return util.format(config.get('fileSystem.scriptUploadDir'), appId);
};

module.exports = CommonServices;

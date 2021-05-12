var util = require('util'),
  path = require('path');

var dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger'),
  CommonServices = require('../commonServices'),
  Filer = require('../../common/filer');

var _instance;

var Setting = function () {};

/*****
Function to retrieve the current application settings.
*****/

Setting.prototype.getSettings = function (queryObject, appId) {
  var query = queryHelper.getSettings,
    conditionBlocks = [];
  if (queryObject) {
    if (!isNaN(queryObject.scenario_id)) {
      query += ' JOIN "projects" p ON s."scenario_template_id" = p."scenario_template_id"';
      conditionBlocks.push('p."id"=' + queryObject.scenario_id);
    }
    if (queryObject.scenario_template_id && isNaN(queryObject.scenario_id)) {
      var parts = queryObject.scenario_template_id.split(',');
      conditionBlocks.push('s."scenario_template_id" IN (' + parts.join(',') + ')');
    }
    if (queryObject && queryObject.keys) {
      var keyParts = queryObject.keys.split(',');
      conditionBlocks.push('s."key" IN (\'' + keyParts.join('\',\'') + '\')');
    }
    if (conditionBlocks.length > 0) {
      query += ' WHERE ' + conditionBlocks.join(' AND ');
    }
    if (queryObject.scenario_template_id && !isNaN(queryObject.scenario_id)) {
      conditionBlocks = []
      query += ' UNION ' + queryHelper.getSettings;
      var parts = queryObject.scenario_template_id.split(',');
      conditionBlocks.push('s."scenario_template_id" IN (' + parts.join(',') + ')');
      if (queryObject && queryObject.keys) {
        var keyParts = queryObject.keys.split(',');
        conditionBlocks.push('s."key" IN (\'' + keyParts.join('\',\'') + '\')');
      }
      if (conditionBlocks.length > 0) {
        query += ' WHERE ' + conditionBlocks.join(' AND ');
      }
    }
  }
  query += ';';
  return dataAccess.executeQuery(appId, query)
    .then(function (result) {
      return new CommonServices().convertSettingArrayToObject(result);
    })
    .catch(function (err) {
      logger.error(appId, 'Error while getting settings!!', err);
      throw err;
    });
};

/*****
used to update setting value by using key
*****/

Setting.prototype.updateSetting = function (settingObject, username, appId) {
  logger.info(appId, 'Settings object', settingObject);
  return dataAccess.executeQuery(appId, util.format(queryHelper.updateSetting, settingObject.value, username, settingObject.key, settingObject.scenario_template_id))
    .then(function (result) {
      if (result && result.rowCount === 1) {
        return constants.setting.updateSuccess;
      } else {
        logger.error(appId, 'Error while updating setting!!', result);
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.setting.errorUpdatingSetting
        };
      }
    });
};

/*****
Function to upload new pdf file to help page.
*****/

Setting.prototype.uploadPage = function (file, username, appId) {
  var scriptUploadDir = new CommonServices().getScriptUploadDir(appId);
  logger.info(appId, 'Uploading file...', {
    Path: path.resolve(__dirname, scriptUploadDir)
  });
  var query = util.format(queryHelper.updateSetting, file.name, username, 'helpPageName', 0);

  return new Filer().copyFile(file.path, path.resolve(__dirname, scriptUploadDir) + '/' + file.name)
    .then(function () {
      return new Filer().deleteFile(file.path);
    })
    .then(function () {
      return dataAccess.executeQuery(appId, query);
    })
    .catch(function (err) {
      logger.error(appId, 'Error uploading!', err);
      throw err;
    });
};

/*****
Function to get pdf file for help page.
This takes as input an list files which has the file name, path, id etc of the script to upload
*****/

Setting.prototype.getHelpPage = function (appId) {
  var scriptUploadDir = new CommonServices().getScriptUploadDir(appId);
  logger.info(appId, 'Retrieving help page...', {
    Path: path.resolve(__dirname, scriptUploadDir)
  });
  var pdfLinkPath = path.resolve(__dirname, scriptUploadDir);

  return dataAccess.executeQuery(appId, queryHelper.getSettings + ' WHERE s."key" IN (\'helpPageName\')')
    .then(function (result) {
      if (result && result.rowCount === 1) {
        return result.rows[0].value;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.setting.pageNotFound
        };
      }
    })
    .then(function (fileName) {
      if (new Filer().fileExistSync(pdfLinkPath + '/' + fileName)) {
        return {
          path: pdfLinkPath,
          file: fileName
        };
      } else {
        logger.error(appId, 'Error retrieving page!', {
          path: pdfLinkPath,
          file: fileName
        });
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.setting.pageNotFound
        };
      }
    });
};

/*****
 Function to retrieve the current tab view.
 *****/

Setting.prototype.getTabView = function (queryObject, appId) {
  var query = util.format(queryHelper.getTabView, queryObject.templateID);
  if (queryObject.type) {
    query += ' AND "type" = \'' + queryObject.type + '\'';
  }
  query += ';';
  return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        return result.rows;
      })
      .catch(function (err) {
        logger.error(appId, 'Error while getting tab view!!', err);
        throw err;
      });
};

/*****
 used to update tab view by using keys
 *****/

Setting.prototype.updateTabView = function (settingObject, appId) {
  logger.info(appId, 'Settings object', settingObject);
  return dataAccess.executeQuery(appId, util.format(queryHelper.updateTabView, settingObject.value, settingObject.type, settingObject.templateID))
      .then(function () {
        logger.info(appId, 'Setting updated successfully');
        return constants.setting.updateSuccess;
      }).catch(function (err) {
        logger.error(appId, 'Error while updating settings!!', err);
        throw err;
      });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Setting();
    }
    return _instance;
  }
};

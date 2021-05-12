var Bluebird = require('bluebird');

var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  settingService = require('../../services/setting').getInstance(),
  logger = require('../../logger'),
  enframeManager = require('../../services/enframeManager');

var _instance;


var Setting = function () {};

/*****
controller to get the settings
*****/
Setting.prototype.getSettings = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving settings...');
  var controllerHelper = new ControllerHelper(res),
    isDetailsQuery= false,
    totalResult;
  if (req.query && req.query.keys) {
    var keyParts = req.query.keys.split(',');
    if (keyParts.includes(constants.setting.details)) {
      isDetailsQuery= true;
      keyParts.splice(keyParts.indexOf(constants.setting.details, 1));
      req.query.keys = keyParts.join(',');
    }
  }
  settingService.getSettings(req.query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved settings.', {
        Outcome: result
      });
      totalResult = result;
      return null;
    })
    .then(function () {
      if (isDetailsQuery) {
        return enframeManager.getAppDetails(req.appData.appId, req.headers.authorization);
      }
      return null;
    })
    .then(function (result) {
      if (result !== null) totalResult.details = result;
      controllerHelper.sendResponse(constants.httpCodes.success, totalResult);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving settings!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
 retrieving app details from Enframe APIs
 *****/
Setting.prototype.getAppDetails = function (req, res) {
  logger.info(req.appData.appId, 'Getting app details');
  var controllerHelper = new ControllerHelper(res);
  enframeManager.getAppDetails(req.appData.appId, req.headers.authorization)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error getting app details', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Controller to update setting based on key
*****/

Setting.prototype.updateSetting = function (req, res) {
  logger.info(req.appData.appId, 'Update settings...');
  var controllerHelper = new ControllerHelper(res);
  settingService.updateSetting(req.body, req.user.username, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error Updating Setting!!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to upload the pdf file for help page.
*****/

Setting.prototype.uploadPage = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  if (!req.body.file || Object.keys(req.body.file).length === 0) {
    logger.error(req.appData.appId, 'Error finding file!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.setting.fileNotFound
    });
  } else {
    settingService.uploadPage(req.body.file, req.user.username, req.appData.appId)
      .then(function (result) {
        logger.info(req.appData.appId, 'Successfully uploaded pdf file.');
        controllerHelper.sendResponse(constants.httpCodes.success, {
          message: constants.setting.uploadSuccess,
          result: result
        });
      })
      .catch(function (err) {
        logger.error(req.appData.appId, 'Error uploading pdf file!', {
          error: err
        });
        controllerHelper.sendErrorResponse(err);
      });
  }
};

/*****
controller to get the help page content
*****/
Setting.prototype.getHelpPage = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving help page...');
  var controllerHelper = new ControllerHelper(res);
  settingService.getHelpPage(req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved help page content.', {
        Outcome: result
      });
      controllerHelper.sendFile(result.file, result.path);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving help page content!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
 controller to get view for input/output tab
 *****/
Setting.prototype.getTabView = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving views...');
  var controllerHelper = new ControllerHelper(res);
  // Checking for the template ID
  if (!req.query.templateID) {
    logger.error(req.appData.appId, 'Template ID missing');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  }
  settingService.getTabView(req.query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved views.', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving views!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
 Controller to update tab view based on tab type
 *****/

Setting.prototype.updateTabView = function (req, res) {
  logger.info(req.appData.appId, 'Update settings...');
  var controllerHelper = new ControllerHelper(res);
  settingService.updateTabView(req.body, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        logger.error(req.appData.appId, 'Error Updating Setting!!', err);
        controllerHelper.sendErrorResponse(err);
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

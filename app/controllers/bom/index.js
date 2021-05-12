var Bluebird = require('bluebird');

var _instance;

var ControllerHelper = require('../../common/controllerHelper'),
  bomService = require('../../services/bom').getInstance(),
  logger = require('../../logger'),
  constants = require('../../common/constants');

var Bom = function() {};

/*****
Function to check bom configuration file.
*****/

Bom.prototype.hasBomConfig = function(req, res) {
  var controllerHelper = new ControllerHelper(res);
  bomService.hasBomConfig(req.appData.appId)
    .then(function(result) {
      logger.info(req.appData.appId, 'Successfully retrieved config file.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function(err) {
      logger.error(req.appData.appId, 'Error getting config file!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to get bom items for dropdown.
*****/

Bom.prototype.getBomItems = function(req, res) {
  var controllerHelper = new ControllerHelper(res);
  bomService.getBomItems(req.params.scenarioId, req.query.table, req.query.tab, req.appData.appId)
    .then(function(result) {
      logger.info(req.appData.appId, 'Successfully got data for bom.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function(err) {
      logger.error(req.appData.appId, 'Error getting data for bom!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
 Function to get bom values for specific element.
 *****/

Bom.prototype.getBomValues = function(req, res) {
  var controllerHelper = new ControllerHelper(res);
  bomService.getBomValues(req.params.scenarioId, req.query.table, req.query.tab, req.query.bom, req.appData.appId)
    .then(function(result) {
      logger.info(req.appData.appId, 'Successfully got data for bom element.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function(err) {
      logger.error(req.appData.appId, 'Error getting data for bom element!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = {
  getInstance: function() {
    if (!_instance) {
      _instance = new Bom();
    }
    return _instance;
  }
};

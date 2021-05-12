var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger'),
  archivingService = require('../../services/archiving').getInstance();

var _instance;

var Archiving = function () {};

/*****
controller to release the lock
*****/

Archiving.prototype.archiveScenario = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Archiving Scenario', req.query);
  archivingService.archiveScenario(req.user, req.query, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while archiving scenario!!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Archiving();
    }
    return _instance;
  }
};

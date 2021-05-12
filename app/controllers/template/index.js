var ControllerHelper = require('../../common/controllerHelper'),
  templateService = require('../../services/template').getInstance(),
  logger = require('../../logger'),
  constants = require('../../common/constants');

var _instance;

var Template = function () {};

Template.prototype.getTemplates = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Getting templates.');
  templateService.getTemplates(req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retreived templates');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while getting templates', err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Template();
    }
    return _instance;
  }
};

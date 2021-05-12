var Bluebird = require('bluebird');

var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger');

var _instance;

var Health = function () {};

/*****
controller to check the health of the app
*****/

Health.prototype.getHealth = function (req, res) {
  logger.info(req.appData.appId, 'Checking health of the app.');
  new ControllerHelper(res).sendResponse(constants.httpCodes.success, {
    result: constants.health.success
  });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Health();
    }
    return _instance;
  }
};

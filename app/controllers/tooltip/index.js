var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  tooltipService = require('../../services/tooltip').getInstance();
var _instance;


var Tooltip = function () {};

/*****
controller to get tooltips pages
*****/

Tooltip.prototype.getTooltips = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  var result = tooltipService.getTooltips();
  controllerHelper.sendResponse(constants.httpCodes.success, result);
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Tooltip();
    }
    return _instance;
  }
};

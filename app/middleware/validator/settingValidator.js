var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');
var SettingValidator = function () {};

SettingValidator.prototype.validateUpdateSetting = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    bodyObject = req.body;
  if (!bodyObject || Object.keys(bodyObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.setting.settingObjectNotFound
    });
  } else if (!bodyObject.key || bodyObject.key.trim() === '') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.setting.settingKeyNotFound
    });
  } else if (typeof (bodyObject.value) === 'undefined') {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.setting.settingValueNotFound
    });
  } else if (isNaN(bodyObject.scenario_template_id)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.template.templateIdNotFound
    });
  } else next();
};



module.exports = SettingValidator;

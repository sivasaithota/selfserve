var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var ArchivingValidator = function () {};

ArchivingValidator.prototype.validateArchivingScenario = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    archiveObject = req.query;
  if (!archiveObject || Object.keys(archiveObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenarioArchiving.archiveObjectNotFound
    });
  } else if (!archiveObject.scenarioIds) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.scenarioArchiving.scenarioIdNotFound
    });
  } else next();

};

module.exports = ArchivingValidator;

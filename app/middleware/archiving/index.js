var Bluebird = require('bluebird');

var archivingService = require('../../services/archiving').getInstance(),
  constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper'),
  logger = require('../../logger');

var Archiving = function () {};

Archiving.prototype.verifyArchive_ScenarioIdInBody = function (req, res, next) {
  _verifyArchive(req.body.scenarioId, req, res, next);
};

Archiving.prototype.verifyArchive_ScenarioIdInParams = function (req, res, next) {
  _verifyArchive(req.params.scenarioId, req, res, next);
};

Archiving.prototype.verifyArchive_ScenarioIdInQuery = function (req, res, next) {
  _verifyArchive(req.query.scenarioId, req, res, next);
};

var _verifyArchive = function (scenarioId, req, res, next) {
  var controllerHelper = new ControllerHelper(res);
  archivingService.verifyArchive(scenarioId, req.appData.appId)
    .then(function (result) {
      if (result) next();
      else {
        controllerHelper.sendErrorResponse({
          code: constants.httpCodes.conflict,
          message: constants.scenarioArchiving.errorVerifyArchive
        });
      }
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while verifying archive for scenario:' + scenarioId, err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = Archiving;

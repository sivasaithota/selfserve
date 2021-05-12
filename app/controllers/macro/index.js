var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  MacroService = require('../../services/macro').getInstance(),
  CommonServices = require('../../services/commonServices'),
  logger = require('../../logger');

var commonServices = new CommonServices();

var _instance;


var Macro = function () {};

/*****
controller to get Macros pages
*****/

Macro.prototype.getWorkbook = function (req, res) {
  logger.info(req.appData.appId, 'Macro initiating...');
  var controllerHelper = new ControllerHelper(res);
  MacroService.downloadWorkbook(req.appData, req.headers.authorization)
    .then(function (filePath) {
      logger.info(req.appData.appId, 'Successfully received workbook.');
      controllerHelper.download(filePath, true);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error downloading workbook', err);
      controllerHelper.sendErrorResponse(err);
    });
};

Macro.prototype.uploadWorkbook = function (req, res) {
  logger.info(req.appData.appId, 'Validating upload file...');
  var controllerHelper = new ControllerHelper(res);

  MacroService.uploadWorkbook(req.body.files, req.body.type, req.appData, req.headers.authorization)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully uploaded file.');
        controllerHelper.sendResponse(constants.httpCodes.success, {
          message: constants.setting.uploadSuccess,
          result: result
        });
      })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error uploading workbook', err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Macro();
    }
    return _instance;
  }
};

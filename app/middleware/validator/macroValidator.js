var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var MacroValidator = function () {};

MacroValidator.prototype.validateUpload = function (req, res, next) {
    var isValidFile = req.body.files && req.body.files.length >= 0;
    var isValidType = req.body.type && (req.body.type === 'input' || req.body.type === 'output');
    if (!isValidFile && !isValidType) {
        logger.error(req.appData.appId, 'Invalid upload request');
        controllerHelper.sendErrorResponse({
            code: constants.httpCodes.badRequest,
            message: constants.setting.fileNotFound
        });
    } else next();
  };

module.exports = MacroValidator;

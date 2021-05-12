var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper'),
  logger = require('../../logger');

var AuthValidator = function () {

};

AuthValidator.prototype.validateLoginCredentials = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    userObject = req.body,
    passPattern = /[A-Za-z0-9!"#$%&'()*+.\/:;<=>?@\[\\\]^_`{|}~-]{1,}$/,
    namePattern = /^[a-zA-Z0-9\'._-]*$/;
  if (!userObject || Object.keys(userObject).length === 0) {
    logger.error(req.appData.appId, 'User object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.authentication.userObjectNotFound
    });
  } else if (!userObject.username || userObject.username.trim() === '') {
    logger.error(req.appData.appId, 'Username not found', userObject);
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.authentication.usernameNotFound
    });
  } else if (!userObject.password) {
    logger.error(req.appData.appId, 'Password not found', userObject);
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.authentication.passwordNotFound
    });
  } else if (userObject.authType === 'regular' && !namePattern.exec(userObject.username)) {
    logger.error(req.appData.appId, 'Username not valid', userObject);
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.authentication.nameNotValidPattern
    });
  } else if (userObject.username.length < 3) {
    logger.error(req.appData.appId, 'Username too short', userObject);
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.authentication.nameNotValidLength
    });
  } else if (userObject.authType === 'regular' && !passPattern.exec(userObject.password)) {
    logger.error(req.appData.appId, 'Password not valid', userObject);
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.authentication.passNotValid
    });
  } else next();
};

module.exports = AuthValidator;

var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper'),
  logger = require('../../logger'),
  CommonValidator = require('./commonValidator'),
  userService = require('../../services/user').getInstance();


var _acceptableRoles = ['BusinessUser', 'Analyst_ReadOnly', 'Analyst_ReadWrite', 'Consultant', 'Analyst_ReadEdit', 'Analyst_Execute', 'Admin', 'Moderator'];

var UserValidator = function () {};

UserValidator.prototype.validateAccessObject = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    accessObject = req.body;
  if (!accessObject || Object.keys(accessObject).length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.accessObjectNotFound
    });
  } else if (!accessObject.scenarioIds || accessObject.scenarioIds.length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.scenarioIdNotFound
    });
  } else if (!accessObject.tableIds || accessObject.tableIds.length === 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.tableIdNotFound
    });
  } else next();
};

/*****
Validate the user details given with respect to updating.
*****/

UserValidator.prototype.validateUpdateUser = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    userObject = req.body || {};
  if (_acceptableRoles.indexOf(userObject.role) < 0) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.invalidRole
    });
  } else {
    userService.checkUserExistById(req.params.userId, req.appData.appId)
      .then(function (result) {
        if (result) next();
        else {
          controllerHelper.sendErrorResponse({
            code: constants.httpCodes.notFound,
            message: constants.user.userDetailsNotFound
          });
        }
      });
  }
};

/*****
Function to check if all the required details to create a user are present and valid.
*****/

UserValidator.prototype.validateAddUser = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res),
    commonValidator = new CommonValidator();
  userObject = req.body.user;
  if (!userObject || Object.keys(userObject).length === 0) {
    logger.error(req.appData.appId, 'User object not found!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.userObjectNotFound
    });
  } else if (!userObject.username || !userObject.username.trim()) {
    logger.error(req.appData.appId, 'Username not entered!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.usernameNotFound,
    });
  } else if (!commonValidator.validateEmail(userObject.email)) {
    logger.error(req.appData.appId, 'Invalid email id entered!');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.invalidEmail
    });
  } else if (_acceptableRoles.indexOf(userObject.role) < 0) {
    logger.error(req.appData.appId, 'Invalid user role entered.');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.invalidRole
    });
  } else if (userObject.role === 'Consultant' && req.user.role === 'Admin') {
    logger.error(req.appData.appId, 'Admin is not able to create Consultant.');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.adminRoleRestriction
    });
  } else if ((userObject.role === 'Consultant' || userObject.role === 'Admin') && req.user.role === 'Moderator') {
    logger.error(req.appData.appId, 'Moderator is not able to create Consultant or Admin.');
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.moderatorRoleRestriction
    });
  } else {
    next();
  }
};

UserValidator.prototype.validateDeleteUser = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res);
  userService.checkUserExistById(req.params.userId, req.appData.appId)
    .then(function (result) {
      if (result) next();
      else {
        controllerHelper.sendErrorResponse({
          code: constants.httpCodes.notFound,
          message: constants.user.userDetailsNotFound
        });
      }
    });
};

UserValidator.prototype.validateGetUserRole = function (req, res, next) {
  var controllerHelper = new ControllerHelper(res);
  if (!new CommonValidator().validateString(req.query.username)) {
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.badRequest,
      message: constants.user.invalidUsername
    });
  } else next();
};

module.exports = UserValidator;

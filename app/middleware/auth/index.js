var userService = require('../../services/user').getInstance(),
  ControllerHelper = require('../../common/controllerHelper'),
  logger = require('../../logger'),
  CommonValidator = require('../validator/commonValidator'),
  constants = require('../../common/constants'),
  keycloak = require('../../middleware/keycloak');

var Auth = function () {};

/*****
Function to authenticate a session of a user. This checks if the token passed is valid and also verifies it has not expired yet.
*****/  

Auth.prototype.ensureAuthenticated = function (req, res, next) {
  try {
    req.user = req.kauth.grant.access_token.content;
    req.user.username = req.user.preferred_username;
    if (keycloak.protect() && !req.kauth.grant || req.user.preferred_username.startsWith('service-account')) {
      req.user = {};
      return next(); // Allow internal access
    }
    var user = req.user;
    if (new CommonValidator().validateString(user.username)) {
      userService.addSsoUserIfNotExist(user.username, req.appData)
        .then(function () {
          userService.getUserRole(user.username, req.appData.appId)
            .then(function (result) {
              req.user = result;
              next();
            })
        })
        .catch(function (err) {
          logger.error(req.appData.appId, 'Error while ensuring authentication.', err);
          new ControllerHelper(res).sendErrorResponse(err);
        });
    } else {
      logger.warning(req.appData.appId, 'Username not found', req.user);
      new ControllerHelper(res).sendErrorResponse({
        code: constants.httpCodes.notFound,
        message: constants.authentication.userNotFound
      });
    }
  } catch(err) {
    throw new Error('Something went wrong while processing JWT token');
  }

};


module.exports = Auth;

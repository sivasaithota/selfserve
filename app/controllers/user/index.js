var userService = require('../../services/user').getInstance(),
  ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger');

var _instance;

var User = function () {};

/*****
Function to retrieve all the users present in the keycloak.
*****/

User.prototype.getAllUsers = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving all users from keycloak...');
  var controllerHelper = new ControllerHelper(res);
  userService.getAllUsers(req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved users.')
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving users list!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to retrieve a user from the keycloak.
*****/

User.prototype.getKCUser = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving a user from keycloak...');
  var controllerHelper = new ControllerHelper(res);
  userService.getKCUser(req.params.mailId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved user.')
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving user!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to add the users to keycloak.
*****/

User.prototype.addKCUser = function (req, res) {
  logger.info(req.appData.appId, 'Adding user to keycloak keycloak...');
  var controllerHelper = new ControllerHelper(res);
  userService.addKCUser(req.body, req.appData.appId)
    .then(function () {
      logger.info(req.appData.appId, 'Successfully added user.')
      controllerHelper.sendResponse(constants.httpCodes.success, {
        message: constants.user.userAdded
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error adding user', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to delete a user taking user id as input.
*****/

User.prototype.deleteUser = function (req, res) {
  logger.info(req.appData.appId, 'Deleting scenario...');
  var controllerHelper = new ControllerHelper(res);
  userService.deleteUser(req.params.userId, req.appData.appId, req.query.updateEnframe, req.headers.authorization)
    .then(function () {
      logger.info(req.appData.appId, 'Successfully deleted scenario.');
      controllerHelper.sendResponse(constants.httpCodes.success, constants.user.deleteSuccess);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error deleting scenario!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to add a user to the app given the username, email, password
*****/

User.prototype.addUser = function (req, res) {
  logger.info(req.appData.appId, 'Adding user...');
  var controllerHelper = new ControllerHelper(res);
  userService.addUser(req.body.user, req.user.username, req.appData.appId, req.body.updateEnframe, req.headers.authorization)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully added new user');
      controllerHelper.sendResponse(constants.httpCodes.successfulCreate, {
        message: constants.user.userAdded,
        result: result
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error adding user!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to retrieve all the users present in the database.
*****/

User.prototype.getAllUser = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving all users...');
  var controllerHelper = new ControllerHelper(res);
  userService.getAllUser(req.user, req.appData.appId, req.headers.authorization)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved users.')
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving users list!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to update the user information taking input of at least one of email, password or role.
*****/

User.prototype.updateUser = function (req, res) {
  logger.info(req.appData.appId, 'Updating user...');
  var controllerHelper = new ControllerHelper(res);
  userService.updateUser(req.params.userId, req.user.username, req.body, req.appData.appId, req.headers.authorization)
    .then(function () {
      logger.info(req.appData.appId, 'Successfully updated user.');
      controllerHelper.sendResponse(constants.httpCodes.success, {
        message: constants.user.updateSuccess
      });
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error updating user!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to get a particular user's details taking user id as input.
*****/

User.prototype.getUser = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving user details...');
  var controllerHelper = new ControllerHelper(res);
  userService.getUser(req.params.userId, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'User retrieved successfully.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving user details!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to get a particular user's details taking user email as input.
*****/

User.prototype.getUserByUsername = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving user details...');
  var controllerHelper = new ControllerHelper(res);
  userService.getUserByUsername(req.body, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'User retrieved successfully.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving user details!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
Function to get roles and their functions.
*****/

User.prototype.getAllRoles = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving all roles...');
  var controllerHelper = new ControllerHelper(res);
  userService.getAllRoles(req.user, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully retrieved roles.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error get roles!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to update the scenario access for the user, it accepts the userid as query param and array of scenario ids for
*****/

User.prototype.manageAccess = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  return userService.manageAccess(req.params.userId, req.body, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error('Error while updating access!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
 controller to export list of users
 *****/

User.prototype.exportUsers = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  if (req.query.withAccess && req.query.withAccess === "true") {
    userService.exportUsersWithAccess(req.user, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        logger.error(req.appData.appId, 'Error export users!', err);
        controllerHelper.sendErrorResponse(err);
      });
  } else {
    userService.exportUsers(req.user, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        logger.error(req.appData.appId, 'Error export users!', err);
        controllerHelper.sendErrorResponse(err);
      });
  }
};

/*****
controller to update list of users by the csv file
*****/

User.prototype.importUsers = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  userService.importUsers(req.body, req.user, req.appData.appId)
    .then(function () {
      return userService.getAllUser(req.appData.appId);
    })
    .then(function (result) {
      controllerHelper.sendResponse(
        constants.httpCodes.success, {
          result: result,
          message: "Import has finished"
        }
      );
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error export users!', err);
      controllerHelper.sendErrorResponse(err);
    });
};


/*****
controller to get user role
*****/

User.prototype.getUserRole = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  userService.addSsoUserIfNotExist(req.query.username, req.appData, req.headers.authorization)
    .then(function () {
      return userService.getUserRole(req.query.username, req.appData.appId);
    })
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while getting user role!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new User();
    }
    return _instance;
  }
};

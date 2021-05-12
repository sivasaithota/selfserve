"use strict";

var express = require("express"),
  userRouter = express.Router();

var userController = require("../../controllers/user").getInstance(),
  UserValidator = require('../validator/userValidator');

module.exports = function (keycloak, auth, accessManager) {
  var userValidator = new UserValidator();
  userRouter.get('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewUserAccess, userController.getAllUsers);
  userRouter.delete('/:userId', keycloak.protect(), auth.ensureAuthenticated, accessManager.deleteUserAccess, userValidator.validateDeleteUser, userController.deleteUser);
  userRouter.get('/role', keycloak.protect(), userValidator.validateGetUserRole, userController.getUserRole);
  userRouter.post('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.addUserAccess, userValidator.validateAddUser, userController.addUser);
  // TODO: change addUser route
  userRouter.post('/addUser', keycloak.protect(), auth.ensureAuthenticated, accessManager.addUserAccess, userController.addKCUser);
  userRouter.get('/find/:mailId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewUserAccess, userController.getKCUser);
  userRouter.get('/all', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewUserAccess, userController.getAllUser);
  userRouter.get('/roles', keycloak.protect(), auth.ensureAuthenticated, accessManager.addUserAccess, userController.getAllRoles);
  userRouter.get('/exportUsers', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewUserAccess, userController.exportUsers);
  userRouter.get('/:userId', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewUserAccess, userController.getUser);
  userRouter.put('/:userId', keycloak.protect(), auth.ensureAuthenticated, accessManager.editUserAccess, userValidator.validateUpdateUser, userController.updateUser);
  userRouter.post('/manageAccess/:userId', keycloak.protect(), auth.ensureAuthenticated, accessManager.editUserAccess, userValidator.validateAccessObject, userController.manageAccess);
  userRouter.post('/importUsers', keycloak.protect(), auth.ensureAuthenticated, accessManager.addUserAccess, userController.importUsers);
  userRouter.post('/getUser', keycloak.protect(), auth.ensureAuthenticated, accessManager.viewUserAccess, userController.getUserByUsername);
  return userRouter;
};

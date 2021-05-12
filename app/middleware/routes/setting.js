var express = require('express'),
  settingRouter = express.Router();

var settingController = require('../../controllers/setting').getInstance(),
  SettingValidator = require('../validator/settingValidator');

module.exports = function (keycloak, auth, accessManager, parser) {
  var settingValidator = new SettingValidator();
  settingRouter.get('/', keycloak.protect(), auth.ensureAuthenticated, settingController.getSettings);
  settingRouter.get('/login', settingController.getSettings);
  settingRouter.put('/', keycloak.protect(), auth.ensureAuthenticated, accessManager.settingAccess, settingValidator.validateUpdateSetting, settingController.updateSetting);
  settingRouter.post('/uploadpage', keycloak.protect(), auth.ensureAuthenticated, accessManager.helpSettingAccess, parser.parseData, settingController.uploadPage);
  settingRouter.get('/help', settingController.getHelpPage);
  settingRouter.get('/tabView', keycloak.protect(), auth.ensureAuthenticated, settingController.getTabView);
  settingRouter.put('/tabView', keycloak.protect(), auth.ensureAuthenticated, accessManager.settingAccess, settingController.updateTabView);
  settingRouter.get('/details', keycloak.protect(), auth.ensureAuthenticated, settingController.getAppDetails);
  return settingRouter;
};

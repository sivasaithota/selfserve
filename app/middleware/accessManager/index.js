var constants = require('../../common/constants'),
  ControllerHelper = require('../../common/controllerHelper');

var logger = require('../../logger');

/*****
Function to check the currently logged in user's permissions.
*****/

var roleFunctions = {
  addScenario: 'Sc_Create',
  copyScenario: 'Sc_Copy',
  deleteScenario: 'Sc_Delete',
  viewScenario: 'Sc_View',
  editScenario: 'Sc_Edit',
  archiveScenario: 'Sc_Archive',
  uploadGridData: 'Grid_Upload',
  downloadGridData: 'Grid_Download',
  viewGridData: 'Grid_View',
  addGridData: 'Grid_Add',
  editGridData: 'Grid_Edit',
  deleteGridData: 'Grid_Delete',
  viewParameter: 'Param_View',
  editParameter: 'Param_Edit',
  viewExecution: 'Exec_View',
  viewExecutionSetting: 'Exec_View_Setting',
  runExecution: 'Exec_Run',
  stopExecution: 'Exec_Stop',
  addUser: 'User_Add',
  editUser: 'User_Edit',
  deleteUser: 'User_Delete',
  viewUser: 'User_View',
  scriptSetting: 'Set_Script',
  tableauSetting: 'Set_Tableau',
  lockSetting: 'Set_Lock',
  setting: 'Setting',
  helpSetting: 'Set_Help',
  execDebug: 'Exec_Debug'
};

var AccessManager = function () {};
AccessManager.prototype.addScenarioAccess = function (req, res, next) { //Check if user can create a new scenario
  _checkAccess(req, res, next, roleFunctions.addScenario);
};

AccessManager.prototype.copyScenarioAccess = function (req, res, next) { //Check if user can copy a scenario
  _checkAccess(req, res, next, roleFunctions.copyScenario);
};

AccessManager.prototype.deleteScenarioAccess = function (req, res, next) { //Check if user can delete a scenario
  _checkAccess(req, res, next, roleFunctions.deleteScenario);
};

AccessManager.prototype.viewScenarioAccess = function (req, res, next) { //Check if user can view a scenario
  _checkAccess(req, res, next, roleFunctions.viewScenario);
};

AccessManager.prototype.editScenarioAccess = function (req, res, next) { //Check if user can edit a scenario
  _checkAccess(req, res, next, roleFunctions.editScenario);
};

AccessManager.prototype.UploadGridDataAccess = function (req, res, next) { //Check if user can upload Grid data
  _checkAccess(req, res, next, roleFunctions.uploadGridData);
};

AccessManager.prototype.downloadGridDataAccess = function (req, res, next) { //Check if user can download Grid data
  _checkAccess(req, res, next, roleFunctions.downloadGridData);
};

AccessManager.prototype.viewGridDataAccess = function (req, res, next) { //Check if user can view Grid data
  _checkAccess(req, res, next, roleFunctions.viewGridData);
};

AccessManager.prototype.addGridDataAccess = function (req, res, next) { //Check if user can add Grid data
  _checkAccess(req, res, next, roleFunctions.addGridData);
};

AccessManager.prototype.editGridDataAccess = function (req, res, next) { //Check if user can edit Grid data
  _checkAccess(req, res, next, roleFunctions.editGridData);
};

AccessManager.prototype.deleteGridDataAccess = function (req, res, next) { //Check if user can delete Grid data
  _checkAccess(req, res, next, roleFunctions.deleteGridData);
};

AccessManager.prototype.viewParameterAccess = function (req, res, next) { //Check if user can view parameter data
  _checkAccess(req, res, next, roleFunctions.viewParameter);
};

AccessManager.prototype.editParameterAccess = function (req, res, next) { //Check if user can edit parameter data
  _checkAccess(req, res, next, roleFunctions.editParameter);
};

AccessManager.prototype.viewExecutionAccess = function (req, res, next) { //Check if user can view execution data
  _checkAccess(req, res, next, roleFunctions.viewExecution);
};

AccessManager.prototype.viewExecutionSettingAccess = function (req, res, next) { //Check if user can view execution setting data
  _checkAccess(req, res, next, roleFunctions.viewExecutionSetting);
};

AccessManager.prototype.runExecutionAccess = function (req, res, next) { //Check if user can run execution
  _checkAccess(req, res, next, roleFunctions.runExecution);
};

AccessManager.prototype.stopExecutionAccess = function (req, res, next) { //Check if user can stop execution
  _checkAccess(req, res, next, roleFunctions.stopExecution);
};

AccessManager.prototype.addUserAccess = function (req, res, next) { //Check if user can add another user
  _checkAccess(req, res, next, roleFunctions.addUser);
};

AccessManager.prototype.editUserAccess = function (req, res, next) { //Check if user can edit other users
  _checkAccess(req, res, next, roleFunctions.editUser);
};

AccessManager.prototype.deleteUserAccess = function (req, res, next) { //Check if user can delete other users
  _checkAccess(req, res, next, roleFunctions.deleteUser);
};

AccessManager.prototype.viewUserAccess = function (req, res, next) { //Check if user can view other users
  _checkAccess(req, res, next, roleFunctions.viewUser);
};

AccessManager.prototype.scriptSettingAccess = function (req, res, next) { //check if user can view/add/update/delete script setting
  _checkAccess(req, res, next, roleFunctions.scriptSetting);
};

AccessManager.prototype.tableauSettingAccess = function (req, res, next) { //check if user can view/add/update/delete tableau setting
  _checkAccess(req, res, next, roleFunctions.tableauSetting);
};

AccessManager.prototype.lockSettingAccess = function (req, res, next) { //check if user can view/add/update/delete lock setting
  _checkAccess(req, res, next, roleFunctions.lockSetting);
};

AccessManager.prototype.settingAccess = function (req, res, next) { //check if user can update setting
  _checkAccess(req, res, next, roleFunctions.setting);
};

AccessManager.prototype.helpSettingAccess = function (req, res, next) { //check if user can upload/delete help setting
  _checkAccess(req, res, next, roleFunctions.helpSetting);
};

AccessManager.prototype.archiveScenarioAccess = function (req, res, next) { //check if user can upload/delete help setting
  _checkAccess(req, res, next, roleFunctions.archiveScenario);
};

AccessManager.prototype.execDebugAccess = function (req, res, next) { //check if user can debug jupiter notebooks
  _checkAccess(req, res, next, roleFunctions.execDebug);
};

/*****
Function to check the particular access requested.
*****/

var _checkAccess = function (req, res, next, checkObject) {
  var controllerHelper = new ControllerHelper(res);
  if (!req.user.username || req.user.functions[checkObject]) {
    next();
  } else {
    logger.error(req.appData.appId, 'Access denied!', checkObject);
    controllerHelper.sendErrorResponse({
      code: constants.httpCodes.forbidden,
      message: constants.accessManager.noAccess
    });
  }
};

module.exports = AccessManager;

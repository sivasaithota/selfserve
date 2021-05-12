var ControllerHelper = require('../../common/controllerHelper'),
  constants = require('../../common/constants'),
  tableauService = require('../../services/tableau').getInstance(),
  logger = require('../../logger'),
  lockingService = require('../../services/locking').getInstance();

var _instance;

var Tableau = function () {};

Tableau.prototype.getTicket = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  tableauService.getTicket(req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error generating tableau ticket!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

Tableau.prototype.runExtract = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Running Tableau Extract.');
  lockingService.checkLocks({
      scenarioId: req.params.scenarioId,
      username: req.user.username,
      explicitLock: true
    }, req.appData.appId)
    .then(function () {
      var extractObject = {
        username: req.user.username,
        type: req.query.type,
        typeId: req.query.typeId,
        jobId: req.query.jobId,
        scenarioId: req.params.scenarioId
      };
      return tableauService.runExtract(extractObject, req.appData.appId);
    })
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error generating tableau ticket!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    })
    .finally(function () {
      return lockingService.removeLock({
        username: req.user.username,
        scenarioId: req.params.scenarioId
      }, req.appData.appId);
    });
};

Tableau.prototype.getAllWorkbooks = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  tableauService.getAllWorkbooks(req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error fetching tableau workbooks and projects !', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

Tableau.prototype.getAllUsers = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  tableauService.getAllUsers(req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error fetching tableau users !', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to add the data to tableau report
*****/

Tableau.prototype.addTableau = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving settings...');
  var controllerHelper = new ControllerHelper(res);
  tableauService.addTableau(req.body, req.user.username, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully add tableau.', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving tableau!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to update the tableau info based on tableau id
*****/

Tableau.prototype.editTableau = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving settings...');
  var controllerHelper = new ControllerHelper(res);
  return tableauService.editTableau(req.params.tableauId, req.body, req.user.username, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully edit tableau.', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving tableau!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to delete the tableau info based on tableau id
*****/

Tableau.prototype.deleteTableau = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving settings...');
  var controllerHelper = new ControllerHelper(res);
  tableauService.deleteTableau(req.params.tableauId, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully delete tableau.', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving tableau!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};


/*****
controller to get the tableau url
*****/

Tableau.prototype.getTableau = function (req, res) {
  logger.info(req.appData.appId, 'Retrieving settings...');
  var controllerHelper = new ControllerHelper(res);
  req.query.userId = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ?
  req.query.userId : false;
  tableauService.getTableau(req.query, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully get tableau.', {
        Outcome: result
      });
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving tableau!', {
        error: err
      });
      controllerHelper.sendErrorResponse(err);
    });
};

/*****
controller to change order id of tableau
*****/

Tableau.prototype.changeOrderId = function (req, res) {
  var controllerHelper = new ControllerHelper(res);
  logger.info(req.appData.appId, 'Retrieving tableau...');
  tableauService.changeOrderId(req.params.tableauId, req.body.orderId, req.appData.appId)
    .then(function (result) {
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error while changing tableau order!', {
        error: err
      });
    });
};

/*****
getting tableau extract settings
*****/

Tableau.prototype.getExtractSetting = function (req, res, next) {
  logger.info(req.appData.appId, 'Getting tableau extract settings...');
  var controllerHelper = new ControllerHelper(res);
  tableauService.getUpdatedExtractSetting({
      username: req.user.username,
    }, req.headers.authorization, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully get tableau extracts.');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error retrieving tableau extract settings!', err);
      controllerHelper.sendErrorResponse(err);
    });
};


/*****
update tableau extract setting
 *****/

Tableau.prototype.updateExtractSetting = function (req, res, next) {
  logger.info(req.appData.appId, 'Updating tableau extract settings...');
  var controllerHelper = new ControllerHelper(res);
  tableauService.updateExtractSetting({
      id: req.params.id,
      runExtract: req.body.runExtract,
      username: req.user.username
    }, req.appData.appId)
    .then(function (result) {
      logger.info(req.appData.appId, 'Successfully updated tableau extract setting');
      controllerHelper.sendResponse(constants.httpCodes.success, result);
    })
    .catch(function (err) {
      logger.error(req.appData.appId, 'Error updating tableau extract settings!', err);
      controllerHelper.sendErrorResponse(err);
    });
};

Tableau.prototype.getReportsUserData = function (req, res, next) {
  logger.info(req.appData.appId, 'Get DB reports user data');
  var controllerHelper = new ControllerHelper(res);

  var result = tableauService.getReportsUserData(req.appData)
  controllerHelper.sendResponse(constants.httpCodes.success, result);
}

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Tableau();
    }
    return _instance;
  }
};

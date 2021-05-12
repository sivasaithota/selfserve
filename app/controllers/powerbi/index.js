const ControllerHelper = require('../../common/controllerHelper'),
  PowerBiService = require('../../services/powerbi'),
  constants = require('../../common/constants'),
  logger = require('../../logger');

const PowerBi = function () {
  const getEmbedUrls = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'get power bi embed token');
    var userId = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role)
    ? req.query.userId : 0;
    PowerBiService().getEmbedUrls(req.query.projectId, req.query.type, userId, req.appData.appId)
      .then(function (token) {
        controllerHelper.sendResponse(constants.httpCodes.success, token);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const addReport = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'Adding powerbi report');
    PowerBiService().addReport(req.body, req.user.username, req.appData.appId)
      .then(function (report) {
        controllerHelper.sendResponse(constants.httpCodes.success, report);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const editReport = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'Editing powerbi report');
    PowerBiService().editReport(req.params.reportId, req.body, req.user.username, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const deleteReport = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'Deleting powerbi report');
    PowerBiService().deleteReport(req.params.reportId, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const getReports = function (req, res) {
    const controllerHelper = new ControllerHelper(res);
    const userId = Number(req.query.userId) === req.user.id && constants.restrictedAccessRoles.includes(req.user.role) ? req.query.userId : false;
    PowerBiService().getReports(userId, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const updateOrderId = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'Updating powerbi order id');
    PowerBiService().changeOrderId(req.params.reportId, req.body.orderId, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const getImportSettings = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    PowerBiService().getUpdatedImportSettings({
      username: req.user.username,
    }, req.headers.authorization, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const updateImportSetting = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'Editing powerbi report');
    PowerBiService().updateImportSetting({
      id: req.params.id,
      appId: req.appData._id,
      runImport: req.body.run_import,
      username: req.user.username
    }, req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  const refreshReports = function (req, res) {
    const controllerHelper = new ControllerHelper(res);

    logger.info(req.appData.appId, 'Refresh reports');
    PowerBiService().refreshDatasets(req.appData.appId)
      .then(function (result) {
        controllerHelper.sendResponse(constants.httpCodes.success, result);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  return {
    getEmbedUrls,
    addReport,
    editReport,
    deleteReport,
    getReports,
    updateOrderId,
    getImportSettings,
    updateImportSetting,
    refreshReports
  };
}

module.exports = PowerBi;

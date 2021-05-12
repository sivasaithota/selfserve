const ControllerHelper = require('../../common/controllerHelper'),
  enframeManager = require('../../services/enframeManager'),
  constants = require('../../common/constants'),
  logger = require('../../logger');

const Themes = function () {
  const getTheme = function (req, res) {
    const controllerHelper = new ControllerHelper(res);
    logger.info(req.appData.appId, 'get themes object');

    return enframeManager.getAppDetails(req.appData.appId, req.headers.authorization)
      .then(function ({ theme }) {
        controllerHelper.sendResponse(constants.httpCodes.success, theme);
      })
      .catch(function (err) {
        controllerHelper.sendErrorResponse(err);
      });
  }

  return {
    getTheme
  };
}

module.exports = Themes;

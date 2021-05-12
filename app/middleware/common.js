const logger = require('../logger');

const cache = require('../common/cache'),
  cacheTtl = require('config').get('server.cacheTtl'),
  constants = require('../common/constants'),
  mongoClient = require('../dataAccess/mongo'),
  ControllerHelper = require('../common/controllerHelper');

class Common {
  setAppData(req, res, next) {
    const appUrl = req.params['appUrl'];
    const appId = cache.get(appUrl);
    if (appId && cache.ttl(appId, cacheTtl)) {
      req.appData = cache.get(appId);
      next();
    } else {
      mongoClient.findOne(constants.dbConstants.databases.enframe, constants.dbConstants.collections.applications, { url: appUrl })
        .then(function (result) {
          if (!result) {
            logger.warning(appUrl, 'Failed to get metadata from mongo for app url ', appUrl);
            new ControllerHelper(res).sendErrorResponse({
              code: constants.httpCodes.notFound,
              message: constants.application.appNotFound,
            });
          }
          result.appId = result._id.toString();
          cache.set(appUrl, result.appId);
          cache.set(result.appId, result, cacheTtl);
          req.appData = cache.get(result.appId);
          next();
        });
    }
  }

  isAppActive(req, res, next) {
    if (req.appData.status !== constants.application.status.active) {
      new ControllerHelper(res).sendErrorResponse({
        code: constants.httpCodes.inActive,
        data: { name: req.appData.name, status: req.appData.status },
      });
    } else next();
  }
}

module.exports = new Common();

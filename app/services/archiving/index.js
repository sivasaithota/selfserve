var Bluebird = require('bluebird'),
  util = require('util');

var queryHelper = require('./queryHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger'),
  dataAccess = require('../../dataAccess/postgres');

var _instance;

var Archiving = function () {};

/*****
verifying whether the user has access to the scenario
 *****/

Archiving.prototype.archiveScenario = function (userObject, archiveObject, appId) {
  var ScenarioIds = archiveObject.scenarioIds.split(',');
  return dataAccess.executeQuery(appId, util.format(queryHelper.archiveScenario, ScenarioIds.toString(), userObject.username))
    .then(function (result) {
      if (result && result.rows && result.rows.length) {
        return result.rows;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenarioArchiving.errorArchivingScenario
        };
      }
    }).catch(function (err) {
      logger.error(appId, 'Error while archiving scenario:' + archiveObject.scenarioId, err);
      throw err;
    });
};

/*****
get lock object using scenario id.
If created by doesn't match with requesting user, then it will throw error, otherwise, it will allow
*****/

Archiving.prototype.verifyArchive = function (scenarioId, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getScenarioArchive, scenarioId))
    .then(function (result) {
      if (result && result.rows && result.rows.length > 0 && result.rows[0].status !== 'active') {
        throw {
          code: constants.httpCodes.conflict,
          message: util.format(constants.scenarioArchiving.scenarioArchived, result.rows[0].name)
        };
      } else {
        return true;
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error while verifying lock for the scenario:' + scenarioId, err);
      throw err;
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Archiving();
    }
    return _instance;
  }
};

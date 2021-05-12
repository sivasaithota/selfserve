var Bluebird = require('bluebird'),
  util = require('util');

var lockingConfig = require('config').get('locking'),
  queryHelper = require('./queryHelper'),
  constants = require('../../common/constants'),
  logger = require('../../logger'),
  dataAccess = require('../../dataAccess/postgres');

var _instance;

var Locking = function () {};

/*****
checks for locking for the username and scenariod id. Lock object contains scenarioId, username, releaseLock and explicitLock.
releaseLock and explicitLock object cannot be together passed.
If release lock is true, it will remove lock immediately
*****/

Locking.prototype.checkLocks = function (lockObject, appId) {
  var query = util.format(queryHelper.scenarioLock, lockObject.releaseLock || false, lockObject.username, lockObject.scenarioId || 0, lockingConfig.timeout, lockObject.explicitLock || 'NULL');
  logger.info(appId, 'Checking lock...', query);
  return dataAccess.executeQuery(appId, query)
    .then(function (result) {
      if (result && result.rows && result.rows.length == 1) {
        logger.info(appId, 'Successfully checked lock.');
        if (result.rows[0].has_access) {
          return true;
        } else {
          throw {
            code: constants.httpCodes.forbidden,
            message: constants.scenarioLocking.accessError + result.rows[0].username + constants.scenarioLocking.accessErrorСontin
          };
        }
      } else {
        logger.error(appId, 'Error checking lock!');
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenario.scenarioLockError
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error checking lock!', err);
      throw err;
    });
};

/*****
It removes the lock based on scenario id and username
just deleting the entries from the "locking" table based on scenario id and username
*****/

Locking.prototype.removeLock = function (lockObject, appId) {
  var query = util.format(queryHelper.removeLock, lockObject.scenarioId, lockObject.username);
  return new Bluebird(function (resolve, reject) {
    logger.info(appId, 'Removing lock...', query);
    return dataAccess.executeQuery(appId, query)
      .then(function () {
        logger.info(appId, 'Successfully removed lock.', lockObject);
        resolve();
      })
      .catch(function (err) {
        logger.error(appId, 'Error removing lock!'.err);
        reject(err);
      });
  });
};

Locking.prototype.releaseLock = function (appId) {
  return dataAccess.executeQuery(appId, queryHelper.removeAll);
};
Locking.prototype.toggleLock = function (lockStatus, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.toggleLock, lockStatus ? 'on' : 'off') + queryHelper.removeAll);
};

/*****
verifying whether the user has access to the scenario
 *****/

Locking.prototype.lockScenario = function (userObject, lockObject, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.lockScenario, lockObject.scenarioId, userObject.username))
    .then(function (result) {
      if (result && result.rows && result.rows.length === 1) {
        return constants.scenarioLocking.scenarioLockSuccess
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenarioLocking.errorLockScenario
        };
      }
    }).catch(function (err) {
      logger.error(appId, 'Error while locking scenario:' + lockObject.scenarioId, err);
      throw err;
    });
};

/*****
remove lock of the scenario by id and user name
if scenario locked by other user, it will throw error
if lock doesn't exist, it will throw error
*****/

Locking.prototype.removeScenarioLock = function (scenarioId, userObject, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.removeScenarioLock, scenarioId, userObject.username))
    .then(function (result) {
      if (result && result.rows && result.rows.length === 1) {
        return constants.scenarioLocking.deleteLockSuccess;
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.scenarioLocking.errorRemoveLock
        };
      }
    }).catch(function (err) {
      logger.error(appId, 'Error while removing lock for scenario:' + scenarioId, err);
      throw err;
    });
};

/*****
get lock object using scenario id.
If created by doesn't match with requesting user, then it will throw error, otherwise, it will allow
*****/

Locking.prototype.verifyLock = function (scenarioId, username, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getScenarioLock, scenarioId))
    .then(function (result) {
      if (result && result.rows && result.rows.length === 1) {
        if (result.rows[0].created_by === username) return true;
        else {
          throw {
            code: constants.httpCodes.conflict,
            message: util.format(constants.scenarioLocking.scenarioLocked, result.rows[0].created_by)
          };
        }
      } else return true;
    })
    .catch(function (err) {
      logger.error(appId, 'Error while verifying lock for the scenario:' + scenarioId, err);
      throw err;
    });
};

/*****
get all scenario lock data by scenario id
*****/

Locking.prototype.getScenarioLock = function (scenarioIds, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getScenarioLock, scenarioIds.join(',')))
    .then(function (result) {
      return result && result.rows ? result.rows : [];
    });
};

Locking.prototype.verifyLockForMultipleScenarios = function(scenarioIds,username,appId){
  var promises = [];
  scenarioIds.forEach( scenarioId => promises.push(this.verifyLock(scenarioId, username, appId)));
  return Bluebird.all(promises);
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Locking();
    }
    return _instance;
  }
};

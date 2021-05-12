var fs = require('fs'),
  path = require('path');

var mongoClient = require('../../app/dataAccess/mongo'),
  constants = require('../../app/common/constants'),
  cache = require('../../app/common/cache');

var Helper = function () {
  var getConfig = function () {
    var appConfig = getAppConfig();
    var appId = appConfig.Application_id;
    var dbConfig;
    return mongoClient.findOne(constants.dbConstants.databases.enframe, constants.dbConstants.collections.applications, {
        _id: mongoClient.getObjectId(appId)
      })
      .then(function (appData) {
        dbConfig = {
          dbserverName: appData.database.serverName,
          port: appData.database.port.toString(),
          dbusername: appData.database.username,
          dbpassword: appData.database.password,
          roleName: appData.database.roleName,
          dbname: appData.database.databaseName,
          roles: appData.database.roles,
        };
        if(appData.reports) dbConfig['reports'] = appData.reports;
        cache.set(appId, {
          database: {
            username: dbConfig.dbusername,
            password: dbConfig.dbpassword,
            databaseName: dbConfig.dbname,
          },
        });
      })
      .then(function() {
        return mongoClient.findOne(constants.dbConstants.databases.enframe, 'settings', {}, {'_id': 0});
      })
      .then(function (result) {
        dbConfig.roles['edsadmin'] = result.edsadmin;
        cache.set('1111', {
          database: {
            username: result.edsadmin.dbusername,
            password: result.edsadmin.dbpassword,
            databaseName: result.edsadmin.dbname,
          },
        });
        cache.set(`1111_${appId}`,{
          database: {
            username: result.edsadmin.dbusername,
            password: result.edsadmin.dbpassword,
            databaseName: dbConfig.dbname,
          },
        });
        return {
          appConfig,
          dbConfig
        };
      });
  }

  var getAppConfig = function () {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../ApplicationConfig.json'), 'utf-8'));
  };

  return {
    getConfig,
  };
}

module.exports = Helper();

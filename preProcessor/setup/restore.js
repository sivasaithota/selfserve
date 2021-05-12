var path = require('path'),
  util = require('util'),
  Bluebird = require('bluebird'),
  filesystemConfig = require('config').get('fileSystem');

var dataAccess = require('../../app/dataAccess/postgres'),
  SQLGenerator = require('./sqlGenerator'),
  PGRunner = require('./pgRunner'),
  PGMigrator = require('../migrate'),
  config = require('../config.json'),
  DBCreator = require('./dbCreator'),
  logger = require('../../app/logger'),
  Filer = require('../../app/common/filer');

var Restore = function (dbaConfig, appConfig) {
  var runRestore = function () {
    var filePath = path.resolve(__dirname, util.format(filesystemConfig.dbFiles, appConfig.Application_id) + '/scenariodata.dump');
    return new DBCreator().run(dbaConfig, 'deploy', appConfig.Application_id)
      .then(function () {
        return new PGRunner().restore(dbaConfig, filePath);
      })
      .then(function () {
        new SQLGenerator(appConfig, config).generateRestoreScripts(dbaConfig);
        return new PGRunner().runSQL(dbaConfig, path.resolve(__dirname, '../sqlScripts/master/script_generated.sql'));
      })
      .then(function () {
        return new PGMigrator({ appId: appConfig.Application_id}).run();
      })
      .then(function () {
        return grantRoleAccess();
      })
      .then(function () {
        return updateReports();
      })
      .then(function () {
        return updateSetting();
      })
      .then(function () {
        return updateCredentials();
      })
      .then(function () {
        return dataAccess.executeQuery(appConfig.Application_id, 'SELECT fn_restore_tables(\'projects\');');
      })
      .then(function () {
        return dataAccess.executeQuery(appConfig.Application_id, 'SELECT fn_restore_tables(\'project_tables\');');
      })
      .then(function () {
        return deleteRestoreFiles(path.dirname(filePath));
      })
  };

  var deleteRestoreFiles = function (filePath) {
    return new Filer().deleteFolder(filePath);
  };

  var updateCredentials = function () {
    var promises = [];
    promises.push(dataAccess.executeQuery(appConfig.Application_id, util.format('DELETE FROM "users" WHERE "username"=\'%s\';', appConfig.userInfo.user.username)));
    promises.push(dataAccess.executeQuery(appConfig.Application_id, util.format('DELETE FROM "users" WHERE "email"=\'%s\';', appConfig.userInfo.user.useremail)));
    return Bluebird.all(promises)
      .then(function () {
        return dataAccess.executeQuery(appConfig.Application_id, util.format('INSERT INTO "users" ("username", "email", "password", "admin", "companyName", "lastLogin", "role", "home_page", "created_by","updated_by") VALUES (\'%s\', \'%s\',\'%s\', true, \'Opex\', now(), \'Consultant\', \'/WSProjects\', \'%s\',\'%s\');', appConfig.userInfo.user.username, appConfig.userInfo.user.useremail, appConfig.userInfo.user.password, appConfig.userInfo.user.username, appConfig.userInfo.user.username));
      });
  };

  var updateSetting = function () {
    var query = 'DELETE  FROM "setting" WHERE "key" IN (\'appId\',\'appName\');';
    return dataAccess.executeQuery(appConfig.Application_id, query)
      .then(function (result) {
        query = util.format('INSERT INTO "setting" ("key", "value", "data_type","created_by", "updated_by") VALUES (\'appId\',\'%s\',\'integer\',\'%s\',\'%s\'),(\'appName\',\'%s\',\'text\',\'%s\',\'%s\') ', appConfig.Application_id, appConfig.userInfo.user.username, appConfig.userInfo.user.username, appConfig.appName, appConfig.userInfo.user.username, appConfig.userInfo.user.username);
        return dataAccess.executeQuery(appConfig.Application_id, query);
      });
  };

  var updateReports = function () {
    var configPath = path.resolve(__dirname, util.format(filesystemConfig.reportFiles, appConfig.Application_id) + '/config.json');
    if (!new Filer().fileExistSync(configPath)) return;
    return new Filer().readFile(configPath)
      .then(function (text) {
        var config = JSON.parse(text);
        var promises = [];

        config.tableau.forEach(function(report) {
          query = util.format('UPDATE "lkp_tableau_report" SET "url"=\'%s\', "project"=\'%s\', "workbook"=\'%s\' WHERE "id"=%s', report.url, report.project, report.workbook, report.id);
          promises.push(dataAccess.executeQuery(appConfig.Application_id, query));
        })
        return Promise.all(promises);
      });
  }

  var grantRoleAccess = function () {
    return dataAccess.executeQuery(appConfig.Application_id, `
      DO $$
        DECLARE
          schema_table RECORD;
        BEGIN
          FOR schema_table IN
            (SELECT schema_name from information_schema.schemata where schema_name not like 'pg_%' and schema_name not like 'information_schema')
          LOOP
            BEGIN
              PERFORM public.grant_schema_access(CAST(schema_table.schema_name AS TEXT));
              RAISE INFO 'GRANTED ACCESS for % SCHEMA', schema_table.schema_name ;
            END;
          END LOOP;
        END
      $$;`);
  }

  return {
    runRestore: runRestore
  };

};
module.exports = Restore;

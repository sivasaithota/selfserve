var path = require('path'),
  fs = require('fs'),
  Bluebird = require('bluebird'),
  util = require('util');

var SQLGenerator = require('./sqlGenerator'),
  BundleGenerator = require('./bundleGenerator'),
  PGRunner = require('./pgRunner'),
  DBCreator = require('./dbCreator'),
  logger = require('../../app/logger'),
  config = require('../config.json'),
  Restore = require('./restore'),
  DBHelper = require('./dbHelper'),
  migrateHelper = require('../migrate/migrateHelper');

var DBGenerator = function (appConfig, dbaConfig) {
  var dType;

  var bundle = function () {
    return new DBCreator().checkDbExists(dbaConfig.dbname)
      .then(function (result) {
        dType = result ? 'redeploy' : 'deploy';
        return dType === 'deploy' ? 0 : new DBHelper().getLastId(appConfig.Application_id);
      })
      .then(function (result) {
        return new SQLGenerator(appConfig, config, result).run(dbaConfig);
      })
      .then(function () {
        return new BundleGenerator().bundle(config.acSQLFiles, config.bundler.acFilePath, dType);
      });
  };

  var deploy = function () {
    logger.info('common', 'Deploying database...' + dbaConfig.dbname);
    return new DBCreator().run(dbaConfig, dType, appConfig.Application_id)
      .then(function () {
        return new PGRunner().runSQL(dbaConfig, config.bundler.acFilePath);
      })
      .then(function () {
        return dType === 'deploy' ? migrateHelper.populateChangeLogs({
          _id: appConfig.Application_id
        }) : true;
      });
  };

  var bundleAndDeploy = function () {
    var filePath = path.resolve(__dirname, util.format('/analytics_center/%s/database', appConfig.Application_id) + '/scenariodata.sql');
    if (fs.existsSync(filePath)) { // this part should be removed after platform code revamp
      return restore();
    } else if (checkPartialDeploy() == true) { // Check if partial deploy is true for any of the templates, if any.
      return partialDeploy(); // If any template's data needs to be saved, redeploy only the remaining templates.
    } else {
      return bundle() // If all templates need redeployment, deploy the app as usual.
        .then(function () {
          return deploy();
        });
    }
  };

  var partialDeploy = function () {
    return new Bluebird(function (resolve, reject) {
        new SQLGenerator(appConfig, config).partialDeploy()
        resolve();
      })
      .then(function () {
        return new PGRunner().runSQL(dbaConfig, config.bundler.scriptGeneratedPath);
      });
  };

  /**************************************************************************
  Function to check if any template's data needs to be saved.
  **************************************************************************/

  var checkPartialDeploy = function () {
    var partialDeployFlag = false;
    if (appConfig.templateList && appConfig.templateList.templates && appConfig.templateList.templates.length > 0) {
      appConfig.templateList.templates.forEach(function (template) {
        if (!template.reset) // If the reset flag for template is false, return true informing that partial deployment is needed and not full app deployment.
          partialDeployFlag = true;
      })
    } else {
      partialDeployFlag = false;
    }
    return partialDeployFlag;
  };

  var restore = function () {
    logger.info('common', 'Restoring app...');
    return new Restore(dbaConfig, appConfig).runRestore();
  };

  return {
    bundle: bundle,
    deploy: deploy,
    bundleAndDeploy: bundleAndDeploy,
    partialDeploy: partialDeploy,
    restore: restore
  };

};

module.exports = DBGenerator;

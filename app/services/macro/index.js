var Bluebird = require('bluebird'),
  path = require('path');

var logger = require('../../logger'),
  Filer = require('../../common/filer'),
  tableauConfig = require('config').get('macros.tableau'),
  dbConfig = require('config').get('database.postgres'),
  jobprocessorConfig = require('config').get('jobprocessor'),
  CommonServices = require('../../services/commonServices'),
  constants = require('../../common/constants'),
  Axios = require('../../common/axios'),
  tableauService = require('../tableau').getInstance(),
  enframeManager = require('../../services/enframeManager');

var commonServices = new CommonServices();

var _instance;

var Macro = function () {};

/*****
Function to run macro services.
*****/

Macro.prototype.downloadWorkbook = async function (appData, token) {
  var envVars = await getEnvironmentVars(appData);
  var appId = appData.appId;
  var [environmentObject] = await enframeManager.getInternalEnvironment('tableau', token);
  var options = {
    method: 'post',
    url: `${jobprocessorConfig.hostname}${jobprocessorConfig.path}/executions/tableau/download`,
    data: {
      appId,
      script: tableauConfig.downloadScript,
      fileName: tableauConfig.tableauFileName,
      hostname: envVars['TABLEAU_DB_HOST'],
      envVars,
      environmentObject
    },
    headers: {
      'authorization': token
    },
  };

  logger.info(appData.appId, 'Getting workbook...', options);

  return new Axios().makeRequest(options)
    .then(function (result) {
      if (result && result.statusCode !== 200) {
        logger.error(appData.appId, 'Error downloading workbook', result.body);
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.tableau.prepareWorkbookError
        };
      }
    })
    .then(function (result) {
      return tableauConfig.tableauFileName;
    });
};

Macro.prototype.uploadWorkbook = async function (filesList, type, appData, token) {
  var appId = appData.appId;
  var uploadPath = path.resolve(__dirname, `${tableauConfig.workspace}/${appId}`);
  var [environmentObject] = await enframeManager.getInternalEnvironment('tableau', token);
  logger.info(appData.appId, 'Initiating workbook publish', uploadPath);

  if (!filesList.length) {
    var newFileArray = [];
    newFileArray.push(filesList);
    filesList = newFileArray;
  }
  var promises = [];
  filesList.forEach(function (file) {
    var sanitizedFileName = commonServices.sanitizeFilename(file.name);

    promises.push(
      new Filer().copyFile(file.path, uploadPath + '/' + sanitizedFileName)
      .then(function () {
        new Filer().deleteFile(file.path);
        return sanitizedFileName;
      }).catch(function (err) {
        throw err;
      }));
  });

  return Bluebird.all(promises)
    .then(async function (fileName) {
      var envVars = await getEnvironmentVars(appData);
      var options = {
        method: 'post',
        url: `${jobprocessorConfig.hostname}${jobprocessorConfig.path}/executions/tableau/upload`,
        data: {
          appId,
          type,
          script: tableauConfig.uploadScript,
          fileName: `${uploadPath}/${fileName[0]}`,
          hostname: envVars['TABLEAU_DB_HOST'],
          envVars,
          environmentObject
        },
        headers: {
          'authorization': token
        },
      };

      logger.info(appData.appId, 'Publishing workbook...', options);

      return new Axios().makeRequest(options)
        .then(function (result) {
          if (result && result.statusCode !== 200) {
            logger.error(appData.appId, 'Error uploading workbook', result.body.error);
            throw {
              code: constants.httpCodes.internalServerError,
              message: result.body.error
            };
          }
        })
        .finally(function () {
          new Filer().deleteFolder(uploadPath);
        });
    });
};

var getEnvironmentVars = async function (appData) {
  var tableauServerCredentials = await commonServices.getGlobalSettings('tableau'),
    reportsUserData = await tableauService.getReportsUserData(appData),
    envVars = {};

  envVars['DB_HOST'] = dbConfig.dbserverName;
  envVars['DB_PORT'] = dbConfig.port;
  envVars['DB_USERNAME'] = appData.database.username;
  envVars['DB_PASSWORD'] = appData.database.password;
  envVars['DB_NAME'] = appData.database.databaseName;
  envVars['DB_REPORTS_USERNAME'] = reportsUserData.username;
  envVars['DB_REPORTS_PASSWORD'] = reportsUserData.password;
  envVars['TABLEAU_DB_HOST'] = tableauServerCredentials.databaseServer;
  envVars['TABLEAU_HOST'] = tableauServerCredentials.server;
  envVars['TABLEAU_USERNAME'] = tableauServerCredentials.username;
  envVars['TABLEAU_PASSWORD'] = tableauServerCredentials.password;
  envVars['TABLEAU_PROJECT_NAME'] = tableauServerCredentials.projectName;
  envVars['TABLEAU_PROJECT_ID'] = await tableauService.getProjectId(tableauServerCredentials.projectName);
  envVars['TABLEAU_SITE_CONTENT_URL'] = tableauServerCredentials.siteContentUrl;

  return envVars;
}

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Macro();
    }
    return _instance;
  }
};

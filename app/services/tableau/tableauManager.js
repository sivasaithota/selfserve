var util = require('util'),
  Bluebird = require('bluebird');

var tableauConfig = require('config').get('tableau'),
  Request = require('../../common/request'),
  constants = require('../../common/constants'),
  dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper'),
  mongoClient = require('../../dataAccess/mongo'),
  logger = require('../../logger'),
  lockingService = require('../locking').getInstance(),
  Axios = require('../../common/axios'),
  async = require('async'),
  CommmonServices = require('../commonServices');

var TableauManager = function () {
  var commonServices = new CommmonServices();

  var getAllWorkbooks = async function () {
    return _makeTableauAPIRequest(tableauConfig.getWorkbooksAPI, constants.tableau.getWorkbookError)
      .then(function (resultObject) {
        var workbookObject = {};
        if (parseInt(resultObject.pagination.totalAvailable) > 0) {
          resultObject.workbooks.workbook.forEach(function (workbook) {
            if (!workbookObject[workbook.project.name]) {
              workbookObject[workbook.project.name] = [];
            }
            workbookObject[workbook.project.name].push(workbook.name);
          });
        }
        var workbooks = [];
        for (var key in workbookObject) {
          workbooks.push({
            project: key,
            workbooks: workbookObject[key]
          });
        }
        return workbooks;
      });
  };

  var tableauSignIn = async function (appId) {
    var tableauDetails = await commonServices.getGlobalSettings('tableau');
    var body = {
      credentials: {
        name: tableauDetails.username,
        password: tableauDetails.password,
        site: {
          contentUrl: tableauDetails.siteContentUrl,
        }
      } 
    }
    var signInAPI = `${await _getTableauUrl()}${tableauConfig.signInAPI}`;
    var options = {
      url: signInAPI,
      method: 'POST',
      json: body,
    };
    return new Request().makeRequest(options)
      .then(function (result) {
        if (result && result.statusCode === 200) {
          return result.body.credentials;
        } else {
          logger.error(appId, 'Failed to sign in to tableau server', {
            status: result.statusCode,
            body: result.body
          });
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.tableau.signinError
          }
        }
      });
  };

  var getAllUsers = async function () {
    return _makeTableauAPIRequest(tableauConfig.getUsersAPI)
      .then(function (resultObject) {
        var users = {
          users: []
        };
        if (parseInt(resultObject.pagination.totalAvailable) > 0) {
          resultObject.users.user.forEach(function (user) {
            users.users.push(user.name);
          });
        }
        return users;
      });
  };

  var _makeTableauAPIRequest = function (urlPath, urlError) {
    return tableauSignIn()
      .then(async function (credentials) {
        var url = `${await _getTableauUrl()}/sites/${credentials.site.id}/${urlPath}`;

        var options = {
          url: url,
          headers: {
            'X-Tableau-Auth': credentials.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        };
        return new Request().makeRequest(options);
      })
      .then(function (result) {
        if (result && result.statusCode === 200) {
          return JSON.parse(result.body);
        } else {
          throw {
            code: constants.httpCodes.internalServerError,
            message: urlError
          }
        }
      })
      .catch(function (error) {
        if (error.code === 'ENOTFOUND') {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.tableau.serverNotFound,
          }
        } else throw error;
      });
  };

  var _getTableauUrl = async function () {
    var tableauDetails = await commonServices.getGlobalSettings('tableau');
    return `${tableauDetails.server}${tableauConfig.apiVersion}`;
  }

  var generateTicket = async function (username, appId) {
    var tableauDetails = await commonServices.getGlobalSettings('tableau');
    var authAPI = `${tableauDetails.reportServer}${util.format(tableauConfig.trustedAuthAPI, username)}`;
    authAPI += `&tableauServer=${tableauDetails.server}`;
    if (tableauDetails.siteContentUrl && tableauDetails.siteContentUrl.trim() !== '') {
      authAPI += `&siteContentUrl=${tableauDetails.siteContentUrl}`;
    }

    logger.info(appId, 'Request sent to fetch tableau trusted token', authAPI);
    return new Request().makeRequest({
        url: authAPI,
        headers: {
          token: tableauDetails.authKey
        }
      })
      .then(function (response) {
        if (response && response.statusCode === 200) {
          return {
            ticket: response.body,
            tableauTrusted: true
          };
        } else {
          logger.error(appId, 'Failed to get trusted authentication token', response);
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.tableau.errorGeneratingTicket
          };
        }
      });
  };

  var runTableauExtract = function (extractObject, appId) {
    return _getWorkbooks(appId)
      .then(function (workbooks) {
        logger.info(appId, 'Making Tableau Extract Request', workbooks);
        if (workbooks && workbooks.length > 0) {
          return makeExtractRequest(workbooks, appId);
        } else {
          logger.warning(appId, constants.tableau.noExtractWorkbookFound, extractObject);
          throw {
            code: constants.httpCodes.notFound,
            message: constants.tableau.noExtractWorkbookFound
          };
        }
      })
      .then(function (result) {
        return dataAccess.executeQuery(appId, util.format(queryHelper.insertTableauExtractStatus, extractObject.scenarioId || null, extractObject.type, result.status, result.logs, extractObject.username, extractObject.username));
      })
      .then(function (result) {
        return result.rows[0];
      });
  };

  var runTableauExtractForExecution = function (extractObject) {
    var jobData = {};
    return mongoClient.findOne(constants.dbConstants.databases.fluentD, 'logStatus', {
        _id: mongoClient.getObjectId(extractObject.jobId)
      })
      .then(function (result) {
        jobData = result;
        logger.info(jobData.appId, 'Running Tableau Extract for Execution', extractObject);

        if (jobData && jobData.status && jobData.status === 'Execution Completed') {
          jobData.status = 'Publishing Reports';
          mongoClient.save(constants.dbConstants.databases.fluentD, 'logStatus', jobData);
          mongoClient.save(constants.dbConstants.databases.fluentD, 'logs', {
            container_name: '/' + jobData.jobId,
            "log": '#businesslog' + constants.tableau.runTableauExtract,
            "time": new Date()
          });
          _runAsyncExtract(jobData, extractObject, jobData.appId);
          return {
            tableauExtract: true
          };
        } else {
          logger.warning(appId, constants.tableau.noExtractRun);
          throw {
            code: constants.httpCodes.conflict,
            message: constants.tableau.noExtractRun
          };
        }
      });
  };

  var _runAsyncExtract = function (jobData, extractObject, appId) {
    var startTime = new Date();
    logger.info(appId, 'Getting workbooks for running extract')
    return _getWorkbooks(appId)
      .then(function (workbooks) {
        if (workbooks && workbooks.length > 0) {
          logger.info(appId, 'Running extracts...');
          return makeExtractRequest(workbooks, appId);
        } else {
          logger.warning(appId, constants.tableau.noExtractWorkbookFound, extractObject);
          throw constants.tableau.noExtractWorkbookFound;
        }
      })
      .then(function (result) {
        return _updateTableauStatus(extractObject, jobData, startTime, result);
      })
      .then(function () {
        logger.info(appId, 'Tableau Extract for execution ran successfully.');
        return;
      })
      .catch(function (err) {
        logger.error(appId, 'Error while running tableau extract for execution', err);
        _updateTableauStatus(extractObject, jobData, startTime, {
          status: 'Publish Report Failed',
          logs: err
        });
      })
      .finally(function () {
        lockingService.removeLock({
          username: extractObject.username,
          scenarioId: extractObject.scenarioId
        }, jobData.appId);
      });
  };

  var _updateTableauStatus = function (extractObject, jobData, startTime, result) {
    var promises = [];
    jobData.status = result.status;
    jobData.endTime = new Date();
    jobData.executionTime += Math.round((jobData.endTime - startTime) / 1000);
    promises.push(dataAccess.executeQuery(jobData.appId, util.format(queryHelper.insertTableauExtractStatus, extractObject.scenarioId, extractObject.type, result.status, result.logs, extractObject.username, extractObject.username)));
    promises.push(mongoClient.save(constants.dbConstants.databases.fluentD, 'logStatus', jobData));
    promises.push(mongoClient.save(constants.dbConstants.databases.fluentD, 'logs', {
      container_name: '/' + jobData.jobId,
      "log": '#businesslog' + result.logs,
      "time": new Date()
    }));
    return Bluebird.all(promises);
  };

  var _getWorkbooks = function (appId) {
    let query = queryHelper.getUniqueWorkbooks;
    return dataAccess.executeQuery(appId, query)
      .then(function (result) {
        return result && result.rows && result.rows.length > 0 ? result.rows : [];
      });
  };

  var makeExtractRequest = async function (workbooks, appId) {
    var tableauDetails = await commonServices.getGlobalSettings('tableau');
    var status = 'Published Reports',
      logs = '';
    return new Bluebird(function (resolve, reject) {
      async.mapSeries(workbooks, function (workbook, done) {
          var workbookDetails = {};
          if (workbook.url && workbook.url.trim() !== '') workbookDetails.url = workbook.url;
          else {
            workbookDetails.workbook = workbook.workbook;
            workbookDetails.project = workbook.project;
          }
          var options = {
            method: 'POST',
            url: tableauConfig.extractAPI,
            headers: {
              token: tableauDetails.authKey
            },
            data: {
              server: {
                url: tableauDetails.server,
                username: tableauDetails.username,
                password: tableauDetails.password,
                siteContentUrl: tableauDetails.siteContentUrl,
              },
              ...workbookDetails
            }
          };
          logger.info('Running tableau extract for the workbook.', options);
          return new Axios().makeRequest(options)
            .then(function (result) {
              if (result && result.statusCode !== 200) {
                logger.warning(appId, 'Extract API task not executed successfully for the workbook:' + workbook.workbook, result.body);
                status = 'Publish Report Failed';
              } else {
                logger.info(appId, 'Successfully executed the extract API task for the workbook:' + workbook.workbook, result.body);
              }
              logs += result.body;
              done();
            }).catch(function (err) {
              logger.error(appId, 'Error while executing the extract api task for the workbook:' + workbook.workbook, err);
              done(err);
            });
        },
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              status: status,
              logs: logs
            });
          }
        });
    });
  };

  var getProjectId = async function (projectName) {
    var url = `/projects?filter=name:eq:${projectName}`;
    return _makeTableauAPIRequest(url)
      .then(function (resultObject) {
        if (parseInt(resultObject.pagination.totalAvailable) === 0) {
          throw {
            code: constants.httpCodes.internalServerError,
            message: constants.tableau.projectNotFound
          }
        }
        else return resultObject.projects.project[0].id;
      });
  }

  return {
    getAllWorkbooks: getAllWorkbooks,
    getAllUsers: getAllUsers,
    generateTicket: generateTicket,
    runTableauExtract: runTableauExtract,
    makeExtractRequest: makeExtractRequest,
    runTableauExtractForExecution: runTableauExtractForExecution,
    _runAsyncExtract: _runAsyncExtract,
    getProjectId: getProjectId,
  };

};

module.exports = TableauManager;

var constants = require('../../common/constants'),
  notebookConfig = require('config').get('notebook'),
  util = require('util'),
  logger = require('../../logger'),
  jobprocessorConfig = require('config').get('jobprocessor'),
  Filer = require('../../common/filer'),
  Axios = require('../../common/axios'),
  enframeManager = require('../enframeManager');

const {
  getConnectorAccessToken
} = require('../connector');

var _instance;

var NotebookManager = function () {};

NotebookManager.prototype.openNotebook = function (appID, actionId, scenarioId, token) {
  var notebookObject = this;

  return updateJupyterRunFile(appID, scenarioId)
    .then(function () {
      return runNoteBookIfNotRunning(appID, actionId, notebookObject, token);
    })
    .delay(5000)
    .then(function (notebook) {
      logger.info(appID, 'Jupyter notebook is ready..');
      return notebook;
    })
    .catch(function (err) {
      logger.error(appID, constants.notebooks.openNotebookError, err);
      throw err;
    });
};

NotebookManager.prototype.removeNotebook = function (appID, token) {
  const options = {
    method: 'delete',
    url: util.format(jobprocessorConfig.hostname + '%s/%s/%s', jobprocessorConfig.path, 'executions/notebook', appID),
    headers: {
      'authorization': token
    },
  };

  return new Axios().makeRequest(options);
};

var updateJupyterRunFile = function (appID, scenarioId) {
  var jupyterRunTemplate = notebookConfig.template;
  jupyterRunTemplate.cells[0].source = notebookConfig.command + " scenario_" + scenarioId + " " + "/app/ApplicationConfig.json";
  return new Filer().writeToFile(util.format(notebookConfig.file, appID), JSON.stringify(jupyterRunTemplate))
    .then(function () {
      logger.info(appID, "updated jupyter run file");
    })
    .catch(function (err) {
      logger.error(appID, "runipynb file update error", err);
      throw err;
    });
};

var runNoteBookIfNotRunning = function (appID, actionId, notebookObject, token) {
  var options = {
    method: 'get',
    url: util.format(jobprocessorConfig.hostname + '%s/%s/%s', jobprocessorConfig.path, 'executions/notebook', appID),
    headers: {
      'authorization': token
    },
  };

  return new Axios().makeRequest(options)
    .then(function (result) {
      return result.body.data;
    })
    .then(function (result) {
      logger.info(appID, 'jupyter status:', result);
      if (result === "") {
        return runNotebook(appID, actionId, token);
      } else if (result === "1/1\n") {
        return appID;
      } else if (result === "0/1\n") {
        return killService(appID, actionId, notebookObject, token);
      }
    })
    .catch(function (err) {
      logger.error(appID, constants.notebooks.openNotebookError, err);
      throw err;
    });
};

var killService = function (appID, actionId, notebookObject, token) {
  return notebookObject.removeNotebook(appID, token)
    .then(function (result) {
      logger.info(appID, 'notebook_id:', result);
      return runNotebook(appID, actionId, token);
    })
    .catch(function (err) {
      logger.error(appID, constants.notebooks.openNotebookError, err);
      throw err;
    });
};

var runNotebook = function (appID, actionId, token) {

  return enframeManager.getAction(appID, actionId, token)
    .then(function(action) {
      return enframeManager.getEnvironment(action.environment, token);
    })
    .then(function (environmentObject) {
      return getConnectorAccessToken(token).then(function ({
        accessToken,
        refreshToken
      }) {
        return {
          environmentObject: environmentObject,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      })
    })
    .then(function ({
      environmentObject,
      accessToken,
      refreshToken
    }) {
      var options = {
        method: 'post',
        url: util.format(jobprocessorConfig.hostname + '%s/%s', jobprocessorConfig.path, 'executions/notebook'),
        data: {
          name: util.format(notebookConfig.notebookName, appID),
          image: environmentObject.name,
          registry: environmentObject.registry,
          appId: appID,
          accessToken: accessToken,
          refreshToken: refreshToken
        },
        headers: {
          'authorization': token
        },
      };

      return new Axios().makeRequest(options);
    })
    .then(function (res) {
      return appID;
    })
    .catch(function (err) {
      logger.error(appID, constants.notebooks.openNotebookError, err);
      throw err;
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new NotebookManager();
    }
    return _instance;
  }
};

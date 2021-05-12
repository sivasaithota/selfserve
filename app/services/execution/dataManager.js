var logger = require('../../logger');

var constants = require('../../common/constants'),
  enframeManager = require('../enframeManager');

var DataManager = function () {

  var getExecutionData = function (queryParams, token) {
    logger.info(queryParams.appId, 'Params for Executing data:', queryParams);
    return _transformExecutionObject(queryParams.appId, queryParams.actionId, token)
      .then(function (result) {
        var executionObject = Object.assign({}, result, queryParams);
        if (!executionObject.file_name) {
          throw new Error(constants.execution.setDefaultScript);
        }
        logger.info(queryParams.appId, 'Script to be executed:', executionObject.file_name);
        return executionObject;
      });
  };

  var _transformExecutionObject = async function (appId, actionId, token) {
    var executionData = await enframeManager.getAction(appId, actionId, token);
    var environmentData = await enframeManager.getEnvironment(executionData.environment, token);

    return {
      environment: environmentData.name,
      command: environmentData.command,
      options: environmentData.options,
      registry: environmentData.registry,
      file_name: executionData.fileName,
      segment: executionData.segment || '',
      instance_type: executionData.instanceType || 'default',
      scenario_specific: executionData.isScenarioSpecific || false,
      action_desc: executionData.description || '',
      type: executionData.type
    };
  }

  return {
    getExecutionData: getExecutionData,
  }
};

module.exports = DataManager;

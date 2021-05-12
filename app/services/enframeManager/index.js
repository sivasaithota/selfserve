const Axios = require('../../common/axios');
const axios = new Axios(addKeycloakToken = false);
const axiosWithToken = new Axios(addKeycloakToken = true);
const enframeUrl = require('config').get('enframe');
const constants = require('../../common/constants');
const logger = require('../../logger');
const mongoClient = require('../../dataAccess/mongo');

class EnframeManager {
  // Fetching application details
  async getAppDetails(appId, token) {
    const detailsRequest = {
      headers: { 'authorization': token },
      method: 'get',
      url: `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}`,
      params: { step: 'application' },
    };
    const themesRequest = {
      headers: { 'authorization': token },
      method: 'get',
      url: `${enframeUrl.hostname}${enframeUrl.path}/themes`,
    };

    // 2 requests - first for app details, second for list of themes to get the selected app theme details
    const response = await Promise.all([
      axios.makeRequest(detailsRequest),
      axios.makeRequest(themesRequest)
    ]);
    const appDetails = response[0].body.result;
    const themes = response[1].body.result;

    // Adding theme details to the app details object
    const appTheme = themes.find(theme => theme._id === appDetails.theme.id);
    appDetails.theme = {
      ...appDetails.theme,
      ...appTheme
    };

    // Deleting DB credentials and app status from the response
    delete appDetails.database;
    delete appDetails.status;

    return appDetails;
  }

  async getActions(appId, params, token) {
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/actions`;
    const options = {
      headers: { 'authorization': token },
      method: 'get',
      url: url,
      params: params
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      logger.debug(appId, 'get actions', response.body.result);
      return response.body.result;
    } else {
      logger.error(appId, 'Failed to get actions', response);
      throw new Error(`Unable to get actions`);
    }
  }

  async getAction(appId, actionId, token) {
    const actions = await this.getActions(appId, {}, token);
    const action = actions.filter(action => action._id === actionId);

    return action.length > 0 ? action[0] : {};
  }

  async getTriggers(appId, params, token) {
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/actions/triggers`;
    const options = {
      headers: { 'authorization': token },
      method: 'get',
      url: url,
      params: params
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      const actions = await this.getActions(appId, {}, token);
      for await (const trigger of response.body.result) {
        trigger.action = actions.filter(action => action._id === trigger.actionId)[0];
        if (trigger.tableId) trigger.tableName = (await this.getTable(appId, trigger.tableId, token)).name;
      }
      logger.debug(appId, 'get triggers', response.body.result);
      return response.body.result;
    } else {
      logger.error(appId, 'Failed to get triggers', response);
      throw new Error(`Unable to get triggers`);
    }
  }

  async getTable(appId, tableId, token) {
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/tables`;
    const options = {
      headers: { 'authorization': token },
      method: 'get',
      url: url
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      logger.debug(appId, 'get tables', response.body.result);
      return response.body.result.find(t => t._id === tableId);
    } else {
      logger.error(appId, 'Failed to get actions', response);
      throw new Error(`Unable to get actions`);
    }
  }

  async updateLastAccessTime(appId, actionId, username) {
    const data = {
      lastAccessedAt: new Date(),
      lastAccessedBy: username
    };
    return mongoClient.updateOne(constants.dbConstants.databases.enframe, constants.dbConstants.collections.actions, {
      '_id': mongoClient.getObjectId(actionId),
    }, {
      $set: data
    })
    .then(function (result) {
      if (result.modifiedCount === 1) return data;
      else {
        logger.error(appId, 'Failed to update last access time', result);
        throw new Error(`Unable to update last access time for action ${actionId}`);
      }
    });
  }

  async getEnvironments(params, token) {
    const type = params.type || '';
    const url = `${enframeUrl.hostname}${enframeUrl.path}/environment/${type}`;
    const options = {
      headers: { 'authorization': token },
      method: 'get',
      url: url,
      params: params,
    };
    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) return response.body;
    throw new Error(`Unable to get environment`);
  }

  async getEnvironment(name, token) {
    const environments = await this.getEnvironments({
      type: constants.environment.types.all
    }, token);
    let environment = environments.filter(env => env.name === name)[0];
    if (!environment.baseImage)
      return environment;
    const baseEnvironment = environments.filter(env => env.name === environment.baseImage)[0];
    return Object.assign(environment, {
      command: baseEnvironment.command,
      options: baseEnvironment.options
    })
  }

  async getInternalEnvironment(internalName, token) {
    const environments = await this.getEnvironments({ type: constants.environment.types.internal}, token);
    logger.info('getting internal environments', environments, internalName);
    return environments.filter(env => env.internalName === internalName);
  }

  async addShare(appId, token, userId, scopes) {
    const data = {
      userId: userId,
      scopes: scopes
    }
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/share`;
    const options = {
      headers: { 'authorization': token },
      method: 'post',
      url: url,
      data: data
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      logger.debug(appId, 'remove share app', response.body.result);
      return response.body.result;
    } else {
      logger.error(appId, 'Failed to add share', response);
      throw new Error(`Unable to add share`);
    }
  }

  async updateShare(appId, token, userId, scopes) {
    const data = {
      userId: userId,
      scopes: scopes,
    }
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/share`;
    const options = {
      headers: { 'authorization': token },
      method: 'PATCH',
      url: url,
      data: data
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      logger.debug(appId, 'update share', response.body.result);
      return response.body.result;
    } else {
      logger.error(appId, 'Failed to update share', response);
      throw new Error(`Unable to update share`);
    }
  }

  async removeShare(appId, token, userId) {
    const data = {
      userIds: [userId],
    }
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/share`;
    const options = {
      headers: { 'authorization': token },
      method: 'DELETE',
      url: url,
      data: data
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      logger.debug(appId, 'removing share app', response.body.result);
      return response.body.result;
    } else {
      logger.error(appId, 'Failed to remove share', response);
      throw new Error(`Unable to removed share`);
    }
  }

  async getUserScopes(appId, token) {
    const url = `${enframeUrl.hostname}${enframeUrl.path}/apps/${appId}/share/users?first=1&shared=true&max=1000`;
    const options = {
      headers: { 'authorization': token },
      method: 'GET',
      url: url,
    };

    const response = await axios.makeRequest(options);
    if (response && response.statusCode === 200) {
      logger.debug(appId, 'retrieving app users', response.body.result);
      return response.body.result;
    } else {
      logger.error(appId, 'Failed to retrieve app users', response);
      throw new Error(`Unable to retrieve users`);
    }
  }
}

module.exports = new EnframeManager();

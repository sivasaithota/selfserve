const connectorConfig = require('config').get('connector');
const axios = require('axios');

const getConnectorAccessToken = async(userAccessToken) => {
  let response = await axios.get(connectorConfig.server + connectorConfig.path + '/auth.token', {
    headers: {
      'Authorization': userAccessToken
    }
  });
  return {
    accessToken: response.data.result.access_token,
    refreshToken: response.data.result.refresh_token
  }
};

module.exports = {
  getConnectorAccessToken
}
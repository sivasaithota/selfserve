var axios = require('axios'),
  Bluebird = require('bluebird'),
  oauth = require('axios-oauth-client'),
  tokenProvider = require('axios-token-interceptor'),
  kcCredentials = require('config').get('keycloak.credentials');

/*****
We use this axios npm for - handle response for long running http request.
But it also has its own limit it can handle responses which take max of 10-12mins.
setting timeout to the request also not working, if nothing works, we need to go with queuing mechanism
*****/

class Axios {
  constructor(addKeycloakToken = false) {
    this._axios = axios.create();
    if (addKeycloakToken) {
      this._axios.interceptors.request.use(
        oauth.interceptor(tokenProvider, oauth.client(axios.create(), {
          url: kcCredentials.url,
          grant_type: kcCredentials.grantType,
          client_id: kcCredentials.clientId,
          client_secret: kcCredentials.clientSecret,
          scope: kcCredentials.scope
        }))
      );
    }
  }

  makeRequest (options) {
    var self = this;
    return new Bluebird(function (resolve, reject) {
      self._axios.request(options).then(function (response) {
          resolve({
            statusCode: response.status,
            body: response.data
          });
        })
        .catch(function (err) {
          if (err && err.request && err.request.res) {
            resolve({
              statusCode: err.request.res.statusCode,
              body: err.response.data
            });
          } else {
            reject(err.message);
          }
        })
    });
  }
}

module.exports = Axios;

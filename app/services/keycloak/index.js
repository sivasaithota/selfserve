var logger = require('../../logger'),
  cache = require('../../common/cache'),
  keycloakConfig = require('config').get('keycloak'),
  KcAdminClient = require('keycloak-admin').default,
  jwtDecode = require('jwt-decode');

var keycloakAdmin = new KcAdminClient({
  'baseUrl': keycloakConfig["auth-server-url"],
  'realmName': keycloakConfig["realm"]
});

var KeycloakManager = function() {
  var callKeycloakClient = async function(fn, ...arg) {
    try {
      if (!keycloakAdmin.accessToken || 
        (keycloakAdmin.accessToken && Date.now() > jwtDecode(keycloakAdmin.accessToken).exp * 1000)) {
        logger.info('common', 'Authenticating service account in keycloak');
        await keycloakAdmin.auth(keycloakConfig.credentials);
      }
      return await fn.bind(keycloakAdmin)(...arg);
    } catch (err) {
      logger.error('common', 'Failed to authenticate service account in keycloak', err);
      if (err && err.message == 'Request failed with status code 401') {
        keycloakAdmin.accessToken = null;
        return callKeycloakClient(fn, ...arg);
      } else throw err;
    }
  }

  var getAllUsers = function () {
    return callKeycloakClient(keycloakAdmin.users.find, { max: 1000 });
  }

  var getUser = function (email) {
    return callKeycloakClient(keycloakAdmin.users.find, { search: email })
      .then( async function (users){
        return users[0]
      });
  }

  var getUserClientRole = function (userId, clientId) {
    logger.info('common', 'Fetching client user role from keycloak');
    return callKeycloakClient(keycloakAdmin.users.listClientRoleMappings, {
      id: userId,
      clientUniqueId: clientId,
    });

  }

  var getClient = async function () {
    logger.info('common', 'Fetching client info from keycloak');
    if (cache.has(keycloakConfig.role_resource)) return cache.get(keycloakConfig.role_resource);
    var client = await callKeycloakClient(keycloakAdmin.clients.find, { clientId: keycloakConfig.role_resource });
    cache.set(keycloakConfig.role_resource, client);
    return client;
  }


  var updateUser = function (userId, data) {
    return callKeycloakClient(keycloakAdmin.users.update,
        { id: userId },
        data
      );
  }

  var addUser = function (user) {
    return callKeycloakClient(keycloakAdmin.users.create, {
      realm: 'enframe',
      firstName: user.firstname,
      lastName: user.lastname,
      username: user.email,
      email: user.email,
      enabled: true,
      attributes: {
        type: user.type,
      },
    })
    .then(function(userId) {
      if(user.type != 'Standalone') return;
      return callKeycloakClient(keycloakAdmin.users.resetPassword, {
        id: userId.id,
        credential: {
          temporary: false,
          type: 'password',
          value: user.password,
        },
      });
    }); 
  }

  return {
    getAllUsers,
    addUser,
    updateUser,
    getUser,
    getClient,
    getUserClientRole,
  };
}

module.exports = KeycloakManager;
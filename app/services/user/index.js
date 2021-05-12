var util = require('util'),
  Bluebird = require('bluebird');

var queryHelper = require('./queryHelper'),
  dataAccess = require('../../dataAccess/postgres'),
  constants = require('../../common/constants'),
  Filer = require('../../common/filer'),
  logger = require('../../logger'),
  KeycloakAdmin = require('../keycloak'),
  CommonServices = require('../commonServices'),
  enframeManager = require('../../services/enframeManager');
var _instance;

var User = function () {};

_writeToFile = function (path, data) {
  var filer = new Filer();
  return filer.writeToFile(path, data);
};

/********
will add user in the database for the userObject
userObject contains username email password
password will be encrypted with hash key and username
********/

User.prototype.addUser = function (userObject, userName, appId, updateEnframe, token) {
  var self = this;
  var homePage = (userObject.role !== 'BusinessUser') ? '\'/WSProjects\'' : null,
    query = util.format(queryHelper.addUser, userObject.username, userObject.email, userObject.role, homePage, userName);
  logger.info(appId, 'Updating user to user management', query);
  return dataAccess.executeQuery(appId, query)
    .then(async function (result) {
      if (result) {
        if(updateEnframe) await self.addShare(appId, token, userObject.id, userObject.role);
        return { userId: result.rows[0].add_user };
      }
      else {
        logger.error(appId, 'Error adding user!', query);
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.user.addUserError
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/********
get all users from keycloak
********/

User.prototype.getAllUsers = function () {
  return KeycloakAdmin().getAllUsers();
};

/********
add users to keycloak
********/

User.prototype.addKCUser = function (user, appId) {
  return new Bluebird(function (resolve, reject) {
      return KeycloakAdmin().addUser(user)
        .then(function (result) {
          resolve(result);
        })
        .catch(function (err) {
          logger.error(appId, 'Error while adding user in keycloak!', err);
          reject('User exists with same username');
        });
  });
};

/********
will delete the user from the users table based on user id
********/

User.prototype.deleteUser = async function (userId, appId, updateEnframe, token) {
  var self = this;
  logger.info(appId, 'Removing user', userId);
  var userObject = await self.getUser(userId, appId);
  return dataAccess.executeQuery(appId, util.format(queryHelper.deleteUser, userId))
    .then(async function (result) {
      if (result && result.rows.length > 0) {
        var kcUser = await KeycloakAdmin().getUser(userObject.email);
        if(updateEnframe) await self.deleteShare(appId, token, kcUser.id);
        logger.info(appId, 'successfully removed user');
      } else {
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.user.deleteUserError
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error while deleting user!', err);
      throw err;
    });
};

/********
Function to get all the users along with the scenario id using left join
********/

User.prototype.getAllUser =  function (currentUser, appId, token) {
  var self = this;
  return dataAccess.executeQuery(appId, queryHelper.getAllUser)
      .then(async function (result) {
        if (result.rows && result.rows.length > 0) {
          var userObject = {};
          var usersScope = await enframeManager.getUserScopes(appId, token);
          var userScope = usersScope.reduce((scope, element) => { scope[element.email] = element; return scope }, {});
          await Promise.all(result.rows.map(async function (user) {
            user.kcUser = await self.getKCUser(user.username);
            return user;
          }));
          result.rows.forEach(async function (user) {
            // Skipping users with Consultant role if current user role is Admin
            if (currentUser.role === 'Admin' && user.role === 'Consultant') return;
            // Skipping users with Consultant, Admin, Moderator roles if current user role is Moderator
            if (currentUser.role === 'Moderator' && (user.role === 'Consultant' || user.role === 'Admin' || user.role === 'Moderator')) return;
            
            if (!userObject[user.id]) {
              userObject[user.id] = {
                id: user.id,
                enframerole: user.kcUser.role.name,
                username: user.username,
                email: user.email,
                role: user.role,
                scopes: userScope[user.email] ? userScope[user.email].scopes : constants.consultantScopes,
                scenario_id: [],
                table_id: [],
                tableau_id: [],
                powerbi_id: [],
              };
            }
            // Adding scenario ID to the resultant scenario IDs array only if it is not there yet
            if (user.scenario_id && userObject[user.id].scenario_id.indexOf(user.scenario_id) === -1) {
              userObject[user.id].scenario_id.push(user.scenario_id);
            }

            // Adding table ID and editable option to the resultant table IDs array only if it is not there yet
            if (user.table_id && !userObject[user.id].table_id.filter(row => row.tableId === user.table_id).length) {
              userObject[user.id].table_id.push({
                tableId: user.table_id,
                isEditable: user.editable
              });
            }
            // Adding reports ID to the resultant report IDs array only if it is not there yet
            if (user.report_id && userObject[user.id].tableau_id.indexOf(user.report_id) === -1) {
              userObject[user.id].tableau_id.push(user.report_id);
            }

            if (user.powerbi_id && userObject[user.id].powerbi_id.indexOf(user.powerbi_id) === -1) {
              userObject[user.id].powerbi_id.push(user.powerbi_id);
            }
          });
          var userResult = [];
          for (var key in userObject) {
            userResult.push(userObject[key]);
          }
          return userResult;
        } else {
          return [];
        }
      })
      .catch(function (err) {
        logger.error(appId, 'Error executing query!', err);
        throw err;
      });
  };

/********
Function to exportUsers with access parameters
********/

// Function to add dependencies between users and scenarios/Tables by username
var addScenarioAndTableDependencies = function (users) {
  return new Bluebird(function (resolve) {
    if (users && users.length > 0) {
      var userObject = {};
      users.forEach(function (user) {
        if (!userObject[user.username]) {
          userObject[user.username] = {
            username: user.username,
            password: user.password,
            email: user.email,
            role: user.role,
            home_page: user.home_page,
            scenario_access: [],
            table_access: []
          };
        }
        // Adding scenario ID to the resultant scenario IDs array only if it is not there yet
        if (user.scenario_access && userObject[user.username].scenario_access.indexOf(user.scenario_access) === -1) {
          userObject[user.username].scenario_access.push(user.scenario_access);
        }
        // Adding table username to the resultant table usernames array only if it is not there yet
        if (user.table_access && userObject[user.username].table_access.indexOf(user.table_access) === -1) {
          userObject[user.username].table_access.push(user.table_access);
        }
      });
      var usersWithDependencies = [];
      for (var key in userObject) {
        usersWithDependencies.push(userObject[key]);
      }
      resolve(usersWithDependencies);
    } else {
      resolve([]);
    }
  });
};


User.prototype.exportUsersWithAccess = function (adminUser, appId) {
  return new Bluebird(function (resolve, reject) {
    dataAccess.executeQuery(
        appId, util.format(queryHelper.exportUsersWithAccess, adminUser.id)
      )
      .then(function (result) {
        return addScenarioAndTableDependencies(result.rows);
      })
    //          Do we need this?
    // .then(function (usersWithDependencies) {
    //   return decryptPasswords(usersWithDependencies);
    // })
      .then(function (userResult) {
        resolve(userResult);
      })
      .catch(function (err) {
        logger.error(appId, 'Error executing query!', err);
        reject(err);
      });
  });

};

/********
Function to exportUsers without access parameters
********/

User.prototype.exportUsers = function (adminUser, appId) {
  return new Bluebird(function (resolve, reject) {
    dataAccess.executeQuery(
        appId, util.format(queryHelper.exportUsers, adminUser.id)
      )
      // Do we need this?
      // .then(function (result) {
      //   return decryptPasswords(result.rows);
      // })
      .then(function (decryptedUsers) {
        resolve(decryptedUsers);
      })
      .catch(function (err) {
        logger.error(appId, 'Error executing query!', err);
        reject(err);
      });
  });
};


/********
Function to importUsers
********/

// This function is not called anywhere. Do we need this?
// function to add dependencies between users and scenarios
var usersScenariosDependencies = function (user, userId, appId) {
  var scenario_access = user.scenario_access ? user.scenario_access : [];
  return Bluebird.map(scenario_access, function (scenarioName) {
    return new Bluebird(function (resolve) {
      dataAccess.executeQuery(appId, util.format(queryHelper.getScenarioIdByName, scenarioName))
        .then(function (getScenarioIdByNameResult) {
          if (getScenarioIdByNameResult.rowCount && getScenarioIdByNameResult.rows[0].id) {
            dataAccess.executeQuery(appId, util.format(queryHelper.createScenarioAccess, userId, getScenarioIdByNameResult.rows[0].id))
              .then(function (getScenarioIdByNameResult) {
                logger.info('dependence between user and scenario created', getScenarioIdByNameResult);
                resolve();
              })
              .catch(function (err) {
                logger.error(appId, 'Error executing query!', err);
                resolve();
              });
          } else {
            resolve();
          }
        })
        .catch(function (err) {
          logger.error(appId, 'Error executing query!', err);
          resolve();
        });
    });
  });
};

// This function is not called anywhere. Do we need this?
// function to add dependencies between users and tables
var usersTablesDependencies = function (user, userId, appId) {
  var table_access = user.table_access ? user.table_access : [];
  return Bluebird.map(table_access, function (tableName) {
    return new Bluebird(function (resolve) {
      dataAccess.executeQuery(appId, util.format(queryHelper.getTableIdByName, tableName))
        .then(function (getTableIdByNameResult) {
          if (getTableIdByNameResult.rowCount && getTableIdByNameResult.rows[0].id) {
            dataAccess.executeQuery(appId, util.format(queryHelper.createTableAccess, userId, getTableIdByNameResult.rows[0].id))
              .then(function (createTableAccess) {
                logger.info('dependence between user and table created', createTableAccess);
                resolve();
              })
              .catch(function (err) {
                logger.error(appId, 'Error executing query!', err);
                resolve();
              });
          } else {
            resolve();
          }
        })
        .catch(function (err) {
          logger.error(appId, 'Error executing query!', err);
          resolve();
        });
    });
  });
};

/********
updating user based on user id
userObject contains username,email,password and role
can update email,password and role
updateEnframe updates the change in enframe if required
********/

User.prototype.updateUser = function (userId, username, userObject, appId, token) {
  var self = this;
  return dataAccess.executeQuery(appId, util.format(queryHelper.updateUser, userId, userObject.role, username))
    .then(async function (result) {
      var kcUser = await KeycloakAdmin().getUser(userObject.email);
      if(userObject.updateEnframe) await self.updateShare(appId, token, kcUser.id, userObject.role);
      if (result && result.rows && result.rows.length) return;
      else {
        logger.error(appId, 'Error while updating user!', result);
        throw {
          code: constants.httpCodes.internalServerError,
          message: constants.user.userNotFound
        };
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

/********
get user based on user id
if user doesn't exist.. empty object will be returned
********/

User.prototype.getUser = function (userId, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getUserById, userId))
    .then(function (result) {
      if (result && result.rows && result.rows.length === 1) {
        return result.rows[0];
      } else {
        return {};
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw constants.user.getUserError;
    });
};

/********
get user based on user email
if user doesn't exist.. empty object will be returned
********/

User.prototype.getUserByUsername = async function (userObject, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getUserByUsername, userObject.email))
    .then(function (result) {
      if (result && result.rows && result.rows.length === 1) {
        return result.rows[0];
      } else {
        return {};
      }
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw constants.user.getUserError;
    });
};

/********
 * Get user with keycloak role
********/

User.prototype.getKCUser = async function (email) {
  var kcUser = await KeycloakAdmin().getUser(email);
  const clientId = (await KeycloakAdmin().getClient())[0].id;
  var role = await KeycloakAdmin().getUserClientRole(kcUser.id, clientId);
  kcUser.role = role[0];
  return kcUser;
}

/********
Function to get all roles
********/

User.prototype.getAllRoles = function (user, appId) {
  var hideRoles = {
    'Admin': ['Consultant'],
    'Moderator': ['Consultant', 'Admin', 'Moderator'],
  };
  var rolesStr = '\'' + (hideRoles[user.role] ? hideRoles[user.role].join('\',\'') : '') + '\'';
  return dataAccess.executeQuery(appId, util.format(queryHelper.getAllRoles, rolesStr))
    .then(function (result) {
      return result.rows;
    })
    .catch(function (err) {
      logger.error(appId, 'Error executing query!', err);
      throw err;
    });
};

User.prototype.manageAccess = function (userId, dataObject, appId) {
  var promises = [];
  var tableData = {};
  dataObject.tableIds.forEach(function (table) {
    tableData[table.tableId] = table.isEditable;
  });
  promises.push(dataAccess.executeQuery(appId, util.format(queryHelper.updateScenarioAccess, userId, dataObject.scenarioIds)));
  promises.push(dataAccess.executeQuery(appId, util.format(queryHelper.updateTableAccess, userId, JSON.stringify(tableData))));
  if (dataObject.tableauIds) {
    promises.push(dataAccess.executeQuery(appId, util.format(queryHelper.updateTableauAccess, userId, dataObject.tableauIds)));
  }
  if (dataObject.powerIds) {
    promises.push(dataAccess.executeQuery(appId, util.format(queryHelper.updatePowerAccess, userId, dataObject.powerIds)));
  }
  return Bluebird.all(promises)
    .then(function (result) {
      return result && result.rows && result.rows.length > 0 ? result.rows : [];
    })
    .catch(function (err) {
      throw new Error(err);
    });
};

User.prototype.checkUserExistById = function (userId, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getUserById, userId))
    .then(function (result) {
      return result && result.rows && result.rows.length > 0;
    });
};

User.prototype.checkUserExistByUsername = function (username, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getUserByUsername, username.toLowerCase()))
    .then(function (result) {
      return result && result.rows && result.rows.length > 0;
    });
};

// Adding user to the app DB if he belongs to one of the SSO domains and he is not in the DB yet
User.prototype.addSsoUserIfNotExist = function (username, appData, token) {
  var self = this;
  return this.checkUserExistByUsername(username, appData.appId)
    .then(async function (result) {

      // user is not found in the DB
      if (!result) {
        var error = {
          code: constants.httpCodes.notFound,
          message: constants.user.userDetailsNotFound
        };  
        var privacyRules = await new CommonServices().getGlobalSettings('acceptedDomains');

        // Finding if user belongs to any of the domains in privacy rules
        var isSsoUser = privacyRules.some(function (domain) {
          return username.endsWith(domain);
        });
        var user = await self.getKCUser(username);
        var isAdminUser = constants.adminUsers.includes(user.role.name);
        // If so, check if user is admin and add the user to the DB
        if (isSsoUser) {
          if (isAdminUser) {
            return self.addUser({
              id: user.id,
              username: username,
              email: username,
              role: 'Consultant',
            }, username, appData.appId,
            true,
            token);
          }
        } else throw error;
      }
    })
    .catch(function (err) {
      throw err;
    });
};

User.prototype.getUserRole = function (username, appId) {
  return dataAccess.executeQuery(appId, util.format(queryHelper.getUserRoleByUsername, username.toLowerCase()))
    .then(function (result) {
      if (result && result.rows && result.rows.length > 0) return _generateUser(result.rows[0]);
      else {
        throw {
          code: constants.httpCodes.notFound,
          message: constants.authentication.userNotFound,
        };
      }
    })
    .catch(function (err) {
      throw err;
    });
};

var _generateUser = function (userObject) {
  userObject.functions = Object.create(Object.prototype);
  for (var irole = 0; irole < userObject.roleFunctions.length; irole++) {
    userObject.functions[userObject.roleFunctions[irole]] = userObject.roleFunctionValues[irole]; //Apply all roles specified in user object.
  }
  delete userObject.roleFunctions;
  delete userObject.roleFunctionValues;
  return userObject;
};

User.prototype.addShare = function (appId, token, userId, role) {
  var scopes = constants.defaultScopes;
  if(constants.appDevEditRoles.includes(role)) {
    scopes = constants.consultantScopes;
  }
  return enframeManager.addShare(appId, token, userId, scopes)
    .then( async function (result){
      return result;
  })
}

User.prototype.updateShare = function (appId, token, userId, role) {
  var scopes = ["read"];
  var updateac = false;
  if(constants.appDevEditRoles.includes(role)) {
    scopes = constants.consultantScopes;
  }
  return enframeManager.updateShare(appId, token, userId, scopes, updateac)
    .then( async function (result){
      return result;
  })
}

User.prototype.deleteShare = function (appId, token, userId) {
  return enframeManager.removeShare(appId, token, userId)
    .then( async function (result){
      return result;
  })
}

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new User();
    }
    return _instance;
  }
};

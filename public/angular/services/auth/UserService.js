(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('UserService', UserService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  UserService.$inject = ['requestService', '$q', '$rootScope', 'tMessages', 'DataService', 'USER_MANAGEMENT_PATH', 'localStorageService','KEYCLOAK_CONFIG'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function UserService(requestService, $q, $rootScope, tMessages, DataService, USER_MANAGEMENT_PATH, localStorageService, KEYCLOAK_CONFIG) {
    // the callable members of the service
    var service = {
      logIn: logIn,
      logOut: logOut,
      checkAuth: checkAuth,
      checkAccess: checkAccess,
      sendToken: sendToken,
      getUrl: getUrl,
      getUserRole: getUserRole,
      getUserInfo: getUserInfo,
      removeUserInfo: removeUserInfo,
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function sendToken(token) {
      var deferred = $q.defer();
      requestService.get('./aut/token?token=' + token)
        .success(function (data, status, headers, config) {
          deferred.resolve(data.user);
        })
        .error(function (data, status, headers, config) {
          // clear storage
          removeUserInfo();
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function logIn(username, password, authType) {
      var deferred = $q.defer();
      requestService.post(USER_MANAGEMENT_PATH + 'aut/v1/login', {
          username: username,
          password: password,
          authType: authType
        })
        .success(function (data, status, headers, config) {
          deferred.resolve(data.result);
        })
        .error(function (data, status, headers, config) {
          // clear storage
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function getUrl(email) {
      var deferred = $q.defer();
      requestService.get(USER_MANAGEMENT_PATH + 'aut/v1/getUrl?email=' + email)
        .success(function (data, status, headers, config) {
          deferred.resolve(data.result);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function logOut() {
      var deferred = $q.defer();
      if (localStorage.getItem('accessToken')) {
        requestService.get(KEYCLOAK_CONFIG.logoutUrl)
          .success(function (data, status, headers, config) {
            // clear storage
            removeUserInfo();
            localStorage.removeItem('userInfo');
            localStorage.removeItem('accessToken')
            deferred.resolve();
          })
          .error(function (data, status, headers, config) {
            deferred.reject(data);
          });
      } else {
        removeUserInfo();
        deferred.resolve();
      }
      return deferred.promise;
    }

    function checkAuth() {
      var deferred = $q.defer();
      var userInfo = getUserInfo();
      var userEmail = JSON.parse(localStorage.getItem('userInfo')).email;
      if (userInfo && userEmail) {
        if (userEmail) {
          deferred.resolve(userEmail);
        } else {
          return getUserRole(userEmail);
        }
      } else {
        removeUserInfo();
        deferred.resolve(false);
      }
      return deferred.promise;
    }

    function checkAccess(id) {
      var cookieObject = getUserInfo();
      if (cookieObject) {
        // allow user to go to the scenario if user object store scenario's id
        var UserAccess = cookieObject.scenarios;
        return UserAccess.length === 0 ? true : _.intersection(UserAccess.split(','), id.toString().split(',')) > 0;
      } else {
        return false;
      }
    }

    function getUserRole() {
      var deferred = $q.defer();
      var userInfo = JSON.parse(localStorage.getItem('userInfo'));
      requestService.get("./user/role?username=" + (userInfo.preferred_username ? userInfo.preferred_username : userInfo.email))
        .success(function (user) {
          user.fullname = DataService.convertUsername(user.username);
          if (user.home_page) {
            if (user.home_page === '/WSProjects') {
              user.home_page = 'base.WSProjects';
            }
            if (user.home_page.indexOf('/project/') >= 0) {
              user.home_page = 'base.project.outputs';
            }
            // save user object in the storage
            localStorageService.set(DataService.getLocation(), user);
            sessionStorage.clear();
            $rootScope.currentUser = user;
            deferred.resolve(user);
          } else {
            deferred.reject(tMessages.getAccess().login);
          }
        })
        .error(function (err) {
          removeUserInfo();
          logOut();
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getUserInfo() {
      return localStorageService.get(DataService.getLocation());
    }

    function removeUserInfo() {
      return localStorageService.remove(DataService.getLocation());
    }
  }
})();

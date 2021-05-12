(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('UserSetService', UserSetService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  UserSetService.$inject = ['requestService', '$q', 'DataService', 'tMessages', 'USER_MANAGEMENT_PATH'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function UserSetService(requestService, $q, DataService, tMessages, USER_MANAGEMENT_PATH) {
    // the callable members of the service
    var service = {
      usersList: usersList,
      userRoles: userRoles,
      addUser: addUser,
      changeManageAccess: changeManageAccess,
      deleteUser: deleteUser,
      editUser: editUser,
      exportUsers: exportUsers,
      importUsers: importUsers,
      exportAppUsers: exportAppUsers,
      createUser: createUser,
      allUsersList: allUsersList,
      getUserByEmail: getUserByEmail
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function exportUsers(withAccess) {
      var deferred = $q.defer();
      requestService.get("./user/exportUsers?withAccess=" + withAccess)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          deferred.resolve(err);
          DataService.error(err);
        });
      return deferred.promise;
    }

    function importUsers(users) {
      var deferred = $q.defer();
      requestService.post("./user/importUsers", users)
        .success(function (data) {
          deferred.resolve(data.result);
          DataService.success(data.message);
        })
        .error(function (err) {
          deferred.reject(err);
          DataService.error(err);
        });
      return deferred.promise;
    }

    function exportAppUsers() {
      var deferred = $q.defer();
      requestService.get(USER_MANAGEMENT_PATH + 'users/v1')
        .success(function (data, status, headers, config) {
          deferred.resolve(data.result);
        })
        .error(function (data, status, headers, config) {
          // clear storage
          removeUserInfo();
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function createUser(data) {
      var deferred = $q.defer();
      requestService.post('./user/addUser', data)
        .success(function (data) {
          DataService.success(data.message);
          deferred.resolve(data);
        })
        .error(function (err) {
          deferred.reject(err);
          DataService.error(err);
        });

      return deferred.promise;
    }

    function allUsersList() {
      var deferred = $q.defer();
      requestService.get('./user/')
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err, 'Error fetching users');
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function usersList() {
      var deferred = $q.defer();
      requestService.get('./user/all')
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function userRoles() {
      var deferred = $q.defer();
      requestService.get('./user/roles')
        .success(function (data) {
          deferred.resolve(DataService.convertRoles(data));
        })
        .error(function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function addUser(user, updateEnframe) {
      var deferred = $q.defer();
      var data = {
        user: user,
        updateEnframe: updateEnframe
      }
      requestService.post('./user', data)
        .success(function (result) {
          result.access = [];
          deferred.resolve(result);
        })
        .error(function (err) {
          if (err.includes('users_username_key')) err = tMessages.getSettings().userNameOccupied;
          if (err.includes('users_email_key')) err = tMessages.getSettings().userEmailOccupied;
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getUserByEmail(email) {
      var deferred = $q.defer();
      requestService.get('./user/find/' + email)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err, 'Error fetching users');
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function changeManageAccess(userId, accessObj) {
      var deferred = $q.defer();
      requestService.post('./user/manageAccess/' + userId, accessObj)
        .success(function () {
          deferred.resolve();
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function deleteUser(user) {
      var deferred = $q.defer();
      requestService.delete('./user/' + user + '?updateEnframe=true')
        .success(function (result) {
          DataService.success(tMessages.getSettings().deleteUser);
          deferred.resolve();
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function editUser(user) {
      var deferred = $q.defer();
      requestService.put('./user/' + user.id, user)
        .success(function (result) {
          DataService.success(result.message);
          deferred.resolve();
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }
})();

(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('ExecuteService', ExecuteService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  ExecuteService.$inject = ['requestService', '$q', '$rootScope', '$location', 'UserService', 'DataService', 'tMessages'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function ExecuteService(requestService, $q, $rootScope, $location, UserService, DataService, tMessages) {
    // the callable members of the service
    var service = {
      getHistory: getHistory,
      executeAction: executeAction,
      getExecutionLogs: getExecutionLogs,
      getJobHistory: getJobHistory,
      validateInput: validateInput,
      stopExecution: stopExecution,
      runExtract: runExtract,
      downloadAction: downloadAction,
      uploadAction: uploadAction
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function getHistory(pid, type, limit, actionIds) {
      var deferred = $q.defer();
      if (UserService.checkAccess(pid)) {
        var path = './execution/history/' + pid + '?type=' + type;
        if (limit) path += '&limit=' + limit;
        if (actionIds) path += '&actionIds=' + actionIds;
        requestService.get(path)
          .success(function (data, status, headers, config) {
            deferred.resolve(data);
          })
          .error(function (data, status, headers, config) {
            DataService.error(data);
            deferred.reject(data);
          });
      } else {
        $location.path($rootScope.currentUser.home_page);
        DataService.error(tMessages.getAccess().restricted);
        deferred.reject();
      }
      return deferred.promise;
    }

    function getJobHistory(pid, jobId) {
      var deferred = $q.defer();
      if (UserService.checkAccess(pid)) {
        requestService.get('./execution/history/' + pid + '/' + jobId)
          .success(function (data, status, headers, config) {
            deferred.resolve(data);
          })
          .error(function (data, status, headers, config) {
            DataService.error(data);
            deferred.reject(data);
          });
      } else {
        $location.path($rootScope.currentUser.home_page);
        DataService.error(tMessages.getAccess().restricted);
        deferred.reject();
      }
      return deferred.promise;
    }

    function validateInput(pid, settings, input) {
      var deferred = $q.defer();
      requestService.get('./execution/run/' + pid + '/' + settings.id + '?type=' + settings.type + '&segment=' +
          settings.segment + '&table=' + input.tablename)
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function executeAction(pid, action) {
      var deferred = $q.defer();
      if (UserService.checkAccess(pid)) {
        requestService.get('./execution/run/' + pid + '/' + action._id, action)
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (data) {
            DataService.error(data);
            deferred.reject(data);
          });
      } else {
        $location.path($rootScope.currentUser.home_page);
        DataService.error(tMessages.getAccess().restricted);
        deferred.reject();
      }
      return deferred.promise;
    }

    function getExecutionLogs(jobId, lastLogId, logType) {
      var deferred = $q.defer();
      var query = './execution/logs/' + jobId + '?lastLogId=' + lastLogId;
      if (logType) {
        query += '&logType=' + logType;
      }
      requestService.get(query)
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          DataService.error(data);
          deferred.reject();
        });
      return deferred.promise;
    }

    function stopExecution(pid, jobId) {
      var deferred = $q.defer();
      requestService.delete('./execution/stop/' + pid + '/' + jobId)
        .success(function (result) {
          deferred.resolve(result);
        })
        .error(function (err, status, headers, config) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function runExtract(pid, jobId, typeId) {
      var deferred = $q.defer();
      requestService.get('./tableau/runExtract/' + pid + '?typeId=' + typeId + '&jobId=' + jobId)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (data) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function downloadAction (actionId, pid) {
      var deferred = $q.defer();
      requestService.get('./execution/download/' + actionId + '?scenarioId=' + pid, {
          responseType: 'blob'
        })
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }

    function uploadAction (actionId, pid, file) {
      var deferred = $q.defer();
      var fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'file');
      fd.append('scenarioId', pid);
      requestService.post('./execution/upload/' + actionId, fd, {
          transformRequest: angular.identity,
          headers: {
            "Content-Type": undefined
          }
        })
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          DataService.error(data);
          deferred.reject(data);
        });
      return deferred.promise;
    }
  }
})();

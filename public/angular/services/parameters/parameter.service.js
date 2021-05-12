(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('ParameterService', ParameterService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  ParameterService.$inject = ['requestService', '$q', '$rootScope', 'UserService', 'DataService', 'tMessages'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function ParameterService (requestService, $q, $rootScope, UserService, DataService, tMessages) {
    // the callable members of the service
    var service = {
      getParameters: getParameters,
      // saveParameters: saveParameters,
      saveParameter: saveParameter,
      loadParameter:loadParameter
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
      // .resolve(value) - resolves the derived promise with the value
      // .reject(reason) – rejects the derived promise with the reason
      // .promise - this method returns a new promise which is resolved or rejected

    function getParameters (pid) {
      var deferred = $q.defer();
      if (UserService.checkAccess(pid)) {
        requestService.get('./scenario/params/?scenarioId=' + pid)
          .success(function(data, status, headers, config){
            deferred.resolve(DataService.converstParameters(data));
          })
          .error(function(data, status, headers, config) {
            deferred.reject(data);
          });
      } else {
        $location.path($rootScope.currentUser.home_page);
        DataService.error(tMessages.getAccess().restricted);
      }
      return deferred.promise;
    }

    function saveParameter (pid, parameter) {
      var deferred = $q.defer();
      if (UserService.checkAccess(pid)) {
        requestService.post('./scenario/param',{
          scenarioId : pid,
          parameter: parameter
        })
          .success(function(data, status, headers, config) {
            deferred.resolve();
          })
          .error(function(err, status, headers, config) {
            DataService.error(err);
            deferred.reject(err);
          });
      } else {
        $location.path($rootScope.currentUser.home_page);
        DataService.error(tMessages.getAccess().restricted);
        deferred.reject();
      }
      return deferred.promise;
    }
    function loadParameter (pid, parameter) {
      var deferred = $q.defer();
      if (UserService.checkAccess(pid)) {
        requestService.get('./scenario/'+ pid +'/parametersList/?groupName=' + parameter.groupName + '&displayName=' + parameter.displayname)
          .success(function(data, status, headers, config) {
            deferred.resolve(data);
          })
          .error(function(err, status, headers, config) {
            DataService.error(err);
            deferred.reject(err);
          });
      } else {
        $location.path($rootScope.currentUser.home_page);
        DataService.error(tMessages.getAccess().restricted);
        deferred.reject();
      }
      return deferred.promise;
    }
  }
})();

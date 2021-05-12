(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('TooltipService', TooltipService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  TooltipService.$inject = ['requestService', '$q', 'DataService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function TooltipService (requestService, $q, DataService) {
    // the callable members of the service
    var service = {
      getTooltips: getTooltips
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
      // .resolve(value) - resolves the derived promise with the value
      // .reject(reason) – rejects the derived promise with the reason
      // .promise - this method returns a new promise which is resolved or rejected

    function getTooltips () {
      var deferred = $q.defer();
      requestService.get('./tooltip')
        .success(function(result) {
          deferred.resolve(result);
        })
        .error(function(err) {
          DataService.error(err);
          deferred.reject();
        });
      return deferred.promise;
    }
  }
})();

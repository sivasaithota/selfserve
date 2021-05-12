(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('BomService', BomService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  BomService.$inject = ['requestService', '$q', 'DataService', 'tMessages'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function BomService(requestService, $q, DataService, tMessages) {
    // the callable members of the service
    var service = {
      getBom: getBom,
      getBomItems: getBomItems,
      getBomValues: getBomValues
    };

    return service;

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function getBom() {
      var deferred = $q.defer();
      requestService.get('./bom')
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject();
        });
      return deferred.promise;
    }

    function getBomItems (data) {
      var deferred = $q.defer();
      requestService.get('./bom/' + data.scenarioId + '?table=' + data.tableName + '&tab=' + data.tabType)
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject();
        });
      return deferred.promise;
    }

    function getBomValues (data) {
      var deferred = $q.defer();
      var url = './bom/' + data.scenarioId + '/value?table=' + data.tableName;
      url += '&tab=' + data.tabType + '&bom=' + data.filteredNodes;
      requestService.get(url)
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject();
        });
      return deferred.promise;
    }

  }
})();

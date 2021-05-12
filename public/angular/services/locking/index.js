(function () {
  'use strict';

  angular
    .module('commonApp')
    .factory('LockService', LockService);

  LockService.$inject = ['requestService', '$q', 'DataService'];

  function LockService(requestService, $q, DataService) {
    // the callable members of the service
    return {
      lockScenario: lockScenario,
      removeScenarioLock: removeScenarioLock
    };

    // lock scenario
    function lockScenario(scenarioId) {
      var deferred = $q.defer();
      requestService.post('./locking', {
        scenarioId: scenarioId
      })
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (error) {
          DataService.error(error);
          deferred.reject(error);
        });
      return deferred.promise;
    }

    // unlock scenario
    function removeScenarioLock(scenarioId) {
      var deferred = $q.defer();
      requestService.delete('./locking/' + scenarioId)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (error) {
          DataService.error(error);
          deferred.reject(error);
        });
      return deferred.promise;
    }
  }
})();

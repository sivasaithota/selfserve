(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('ArchiveService', ArchiveService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  ArchiveService.$inject = ['requestService', '$q', 'DataService', 'tMessages', '$rootScope'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function ArchiveService(requestService, $q, DataService, tMessages, $rootScope) {
    // the callable members of the service
    return {
      archiveScenario: archiveScenario
    };

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    // Archiving the scenario(s)
    function archiveScenario(scenarioIDs, scenarioNames) {
      // Saving info to the processedScenarios array
      scenarioIDs.forEach(function (id) {
        $rootScope.processedScenarios.push({
          id: id,
          process: 'archiving'
        });
      });

      requestService.post('./archiving?scenarioIds=' + scenarioIDs.join())
        .success(function (result) {
          // Clearing info from the processedScenarios array
          result.forEach($rootScope.removeProcessedScenario);
          DataService.success('Scenario(s) ' + scenarioNames.join(', ') + tMessages.getScenario().archived);

          // Emitting event to the project controller about successful finishing the scenario archiving
          $rootScope.$emit('markArchivedScenarios', { scenarios: result });
        })
        .error(function (err, status) {
          scenarioIDs.forEach($rootScope.removeProcessedScenario);
          DataService.error(err);

          // Emitting event to the project controller about unsuccessful finishing the scenario archiving
          $rootScope.$emit('markArchivedScenarios', {
            error: err,
            scenarios: scenarioIDs
          });
        });
    }

  }
})();

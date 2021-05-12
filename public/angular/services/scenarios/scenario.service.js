(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('commonApp')
    .factory('ScenarioService', ScenarioService);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  ScenarioService.$inject = ['requestService', '$q', 'DataService', 'tMessages', '$rootScope'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function ScenarioService(requestService, $q, DataService, tMessages, $rootScope) {
    // Scenarios are being processed (copied/deleted/edited/archived) at the moment of time
    $rootScope.processedScenarios = [];

    // removing processed scenario from the list by scenario ID or placeholder ID
    $rootScope.removeProcessedScenario = function (data) {
      _.remove($rootScope.processedScenarios, function (processedScenario) {
        return (data.id || data) === (processedScenario.placeholderID || processedScenario.id);
      });
    };

    // the callable members of the service
    return {
      getAppName: getAppName,
      getAllScenarios: getAllScenarios,
      getCurrentProject: getCurrentProject,
      deleteScenario: deleteScenario,
      editScenario: editScenario,
      createScenario: createScenario,
      copyScenario: copyScenario,
      getInfoPage: getInfoPage,
      changeOrderId: changeOrderId,
      getAllTables: getAllTables,
      getBom: getBom,
      saveTag: saveTag,
      getTags: getTags,
      getTemplateTables: getTemplateTables,
      getUpdatedInputsParameters: getUpdatedInputsParameters,
      getNotebookURL: getNotebookURL,
      removeNotebook: removeNotebook
    };

    // $q - a service that helps you run functions asynchronously,
    // and use their return values (or exceptions) when they are done processing.

    // $q.defer() call construction a new instance of deferred
    // .resolve(value) - resolves the derived promise with the value
    // .reject(reason) – rejects the derived promise with the reason
    // .promise - this method returns a new promise which is resolved or rejected

    function getAppName() {
      var deferred = $q.defer();
      requestService.get('./setting/login?keys=displayName')
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    // Fetching all the scenarios and template data from the server
    function getAllScenarios(type) {
      var deferred = $q.defer();
      var query = './scenario/all';
      if (type) query += '?type=' + type;

      requestService.get(query)
        .success(function (result) {
          // Adding/updating scenarios being processed at the moment
          $rootScope.processedScenarios.forEach(function (processedScenario) {
            if (processedScenario.process === 'copying') result.scenarios.push(processedScenario);
            else {
              var scenarioToUpdate = _.find(result.scenarios, { id: processedScenario.id });
              if (scenarioToUpdate) scenarioToUpdate.process = processedScenario.process;
            }
          });

          deferred.resolve(result);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });

      return deferred.promise;
    }

    function getCurrentProject(project_id) {
      var deferred = $q.defer();
      requestService.get('./scenario/' + project_id)
        .success(function (result) {
          deferred.resolve(result);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    // Deleting the scenario(s)
    function deleteScenario(scenarioIDs, scenarioNames) {
      // Saving info to the processedScenarios array
      scenarioIDs.forEach(function (id) {
        $rootScope.processedScenarios.push({
          id: id,
          process: 'deleting'
        });
      });

      // Sending request to the server to delete the scenario(s)
      requestService.delete(
        './scenario?scenarioIds=' + scenarioIDs.join()
      ).success(function () {
        // Clearing info from the processedScenarios array
        scenarioIDs.forEach($rootScope.removeProcessedScenario);
        DataService.success('Scenario(s) ' + scenarioNames.join(', ') + tMessages.getScenario().deleted);

        // Emitting event to the project controller about successful finishing the scenario deleting
        $rootScope.$emit('deleteScenarios', { scenarioIDs: scenarioIDs });
      }).error(function (err, status) {
        scenarioIDs.forEach($rootScope.removeProcessedScenario);
        DataService.error(err);

        // Emitting event to the project controller about unsuccessful finishing the scenario deleting
        $rootScope.$emit('deleteScenarios', {
          error: err,
          scenarioIDs: scenarioIDs
        });
      });
    }

    // Editing the scenario
    function editScenario(scenario) {
      $rootScope.processedScenarios.push(scenario);

      requestService.put('./scenario/' + scenario.id, {
        name: scenario.newName,
        tagID: scenario.tag_id
      }).success(function (data) {
        $rootScope.removeProcessedScenario(scenario.id);
        DataService.success(data.message);

        // Emitting event to the project controller about successful finishing the scenario editing
        $rootScope.$emit('editScenario', { scenario: data.result });
      }).error(function (err, status) {
        $rootScope.removeProcessedScenario(scenario.id);
        DataService.error(err);

        // Emitting event to the project controller about unsuccessful finishing the scenario editing
        $rootScope.$emit('editScenario', {
          error: err,
          scenario: scenario
        });
      });
    }

    function createScenario(project) {
      var deferred = $q.defer();
      requestService.post('./scenario', project)
        .success(function (result) {
          DataService.success(tMessages.getScenario().created);
          deferred.resolve(result);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function saveTag(tag) {
      var deferred = $q.defer();
      requestService.post('./scenario/tags/save', {
        tagName: tag,
        tagType: "scenario"
      })
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getTags() {
      var deferred = $q.defer();
      requestService.get('./scenario/tags/list')
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    // Copying the existing scenario
    function copyScenario(scenario) {
      $rootScope.processedScenarios.push(scenario);

      requestService.post('./scenario/copy/' + scenario.id, {
        newScenarioName: scenario.name
      }).success(function (result) {
        // Clearing copied scenario from the processedScenarios array
        $rootScope.removeProcessedScenario(scenario.placeholderID);

        DataService.success(scenario.originalName + tMessages.getScenario().copied);
        // Emitting event to the project controller about successful finishing the scenario copying
        $rootScope.$emit('addScenario', {
          scenario: result,
          placeholderID: scenario.placeholderID
        });
      }).error(function (err, status) {
        $rootScope.removeProcessedScenario(scenario.placeholderID);
        DataService.error(err);

        // Emitting event to the project controller about unsuccessful finishing the scenario copying
        $rootScope.$emit('addScenario', {
          error: err,
          placeholderID: scenario.placeholderID
        });
      });
    }

    function getInfoPage(scenarioId) {
      var deferred = $q.defer();
      if ($rootScope.infoPage[scenarioId]) {
        deferred.resolve($rootScope.infoPage[scenarioId]);
      } else {
        requestService.get('./scenario/page/info/' + scenarioId)
          .success(function (result) {
            $rootScope.infoPage[scenarioId] = result;
            deferred.resolve(result);
          })
          .error(function (err) {
            DataService.error(err);
            deferred.reject(err);
          });
      }
      return deferred.promise;
    }

    function changeOrderId(scenarioId, orderId) {
      var deferred = $q.defer();
      requestService.put('./scenario/changeorder/' + scenarioId, {
        order_id: orderId
      })
        .success(function (result) {
          deferred.resolve(result);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function getAllTables(userId) {
      var deferred = $q.defer();
      requestService.get('./scenario/allTables?userId=' + userId)
        .success(function (data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject();
        });
      return deferred.promise;
    }

    function getBom() {
      var deferred = $q.defer();
      requestService.get('./bom')
        .success(function (data, status, headers, config) {
          if (data.error) {
            DataService.error(data.error);
          }
          deferred.resolve(data);
        })
        .error(function (err) {
          DataService.error(err);
          deferred.reject();
        });
      return deferred.promise;
    }

    // Fetching tables by template ID
    function getTemplateTables(templateID) {
      var deferred = $q.defer();

      requestService.get('./scenario/tables/' + templateID).success(function (data) {
        deferred.resolve(data);
      }).error(function (err) {
        DataService.error(err);
        deferred.reject();
      });

      return deferred.promise;
    }

    // Fetching input tables and parameters updated since the last execution of the primary script
    function getUpdatedInputsParameters(scenarioId) {
      var deferred = $q.defer();
      requestService.get('./scenario/updatedInputsParameters/' + scenarioId)
        .success(function (data) {
          deferred.resolve(data);
        }).error(function (err) {
          DataService.error(err);
          deferred.reject();
        });

      return deferred.promise;
    }

    function getNotebookURL(pid, actionId) {
      var deferred = $q.defer();
      requestService.get('./scenario/notebook?actionId=' + actionId + '&scenarioId=' + pid)
        .success(function (data) {
          deferred.resolve(data);
          return data.notebookURL;
        })
        .error(function () {
          deferred.reject();
        });
      return deferred.promise;
    }

    function removeNotebook() {
      var deferred = $q.defer();
      requestService.delete('./scenario/notebook')
        .success(function () {
          deferred.resolve();
          return;
        })
        .error(function () {
          deferred.reject();
        });
      return deferred.promise;
    }

  }
})();

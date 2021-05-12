(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('jupyter', jupyter);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jupyter.$inject = ['$scope', '$stateParams', 'ScenarioService', 'ScenarioSetService', '$rootScope', 'DataService', 'tMessages'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jupyter($scope, $stateParams, ScenarioService, ScenarioSetService, $rootScope, DataService, tMessages) {
    // represent the binding scope
    var vm = this;
    vm.url = '';
    vm.openNotebook = openNotebook;
    vm.removeNotebook = removeNotebook;
    vm.appDisplayName = $scope.main.appDetails.displayName;
    vm.progressBar = $rootScope.progressBar;

    function openNotebook() {
      if (!$stateParams.pid) {
        DataService.error(tMessages.getJupyter().missingScenarioId);
        return;
      }

      vm.progressBar.start();
      ScenarioSetService.getActions()
        .then(function (data) {
          var primaryAction = data.find(function (action) {
            return action.type === 'primary';
          });
          if(!primaryAction) throw new Error(tMessages.getJupyter().noPrimaryAction);
          return ScenarioService.getNotebookURL($stateParams.pid, primaryAction._id);
        })
        .then(function (res) {
          vm.url = window.location.origin.concat('/jupyter' + res.notebookURL);
          vm.progressBar.complete();
        })
        .catch(function (err) {
          vm.progressBar.reset();
          if (!err.message.includes(tMessages.getJupyter().noPrimaryAction))
            err.message = tMessages.getJupyter().failedToOpen;
          DataService.error(err.message);
        });
    }

    function removeNotebook(event) {
      event.stopPropagation();
      vm.progressBar.start();

      ScenarioService.removeNotebook()
        .then(function () {
          vm.progressBar.complete();
          window.close();
        })
        .catch(function () {
          vm.progressBar.reset();
          DataService.error(tMessages.getJupyter().failedToClose);
        });
    }

    openNotebook();
  }
})();

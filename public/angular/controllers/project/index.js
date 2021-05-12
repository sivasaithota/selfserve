(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('workspaceDetails', workspaceDetails);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  workspaceDetails.$inject = ['$scope', 'allScenarios', 'infoScenario', 'resourceCount', '$state',
    '$stateParams', 'ScenarioService', 'DataService', '$location', 'LockService', 'ngProgressFactory', 'ScenarioSetService', '$q',
    'actions', 'triggers', '$rootScope', '$filter'
  ];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function workspaceDetails ($scope, allScenarios, infoScenario, resourceCount, $state,
     $stateParams, ScenarioService, DataService, $location, LockService, ngProgressFactory, ScenarioSetService, $q, actions,
     triggers, $rootScope, $filter
  ) {
    // represent the binding scope
    var vm = this;
    var currentState = $state.current.name;
    var isInputVisible = $scope.main.currentUser.role === 'Consultant' ||
      resourceCount.tables.input ||
      resourceCount.tableau && resourceCount.tableau.input;
    var isOutputVisible = $scope.main.currentUser.role === 'Consultant' ||
      resourceCount.tables.output ||
      resourceCount.tableau && resourceCount.tableau.output;
    // TODO: remove this dirty hack, redirecting from inputs to outputs if there is no input tables, and vice versa,
    // once we have proper requirements for the scenario page routing
    if (!isInputVisible && $state.current.name === 'base.project.inputs') {
      $state.go('base.project.outputs');
    }
    if (!isOutputVisible && $state.current.name === 'base.project.outputs') {
      $state.go('base.project.inputs');
    }

    angular.extend(vm, {
      pid: $stateParams.projId,
      state: $state,
      showInput: true,
      showOutput: true,
      showInputTab: isInputVisible,
      showOutputTab: isOutputVisible,
      projectDetails: infoScenario,
      lockScenario: lockScenario,
      scenarioTab: currentState.substring(currentState.lastIndexOf('.') + 1, currentState.length),
      progressBar: ngProgressFactory.createInstance(),
      actions: actions,
      triggers: triggers,
    });

    $rootScope.scenariosList = $filter('orderBy')(allScenarios.scenarios, 'order_id');
    $rootScope.scenarioTab = vm.scenarioTab;

      ScenarioService.getInfoPage(vm.pid)
      .then(function (data) {
        var visibleTab = _.sortByOrder(_.filter(data, {visible: true}), ['id'],['asc']);
        // get information about tabs' name
        vm.inputs = _.find(data, {type: 'inputs'});
        vm.outputs = _.find(data, {type: 'outputs'});
        vm.parameters = _.find(data, {type: 'parameters'});
      });

    // Fetching info if the outputs are outdated
    if (vm.scenarioTab === 'outputs') {
      Promise
        .all([
          ScenarioService.getUpdatedInputsParameters(vm.pid),
          ScenarioSetService.getSettings({ keys: 'hideOutdatedOutputWarning' })
        ])
        .then(function (result) {
          var data = result[0];
          var setting = result[1];

          // Outputs are outdated if scenario is not archived
          // and any input table or parameter was updated since the last execution
          $rootScope.outdatedOutput = vm.projectDetails.status === 'active'
            && (data.inputs.length > 0 || data.parameters.length > 0) && !setting.hideOutdatedOutputWarning;
        });
    }

    function lockScenario (id, project) {
      LockService.lockScenario(id)
        .then(function () {
          project['locking'] = {
            created_by: $scope.main.currentUser.username
          };
          vm.progressBar.complete();
        }, function () {
          vm.progressBar.reset();
        });
    }

  }
})();

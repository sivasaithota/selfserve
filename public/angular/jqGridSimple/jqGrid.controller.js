(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridMain')
    .controller('jqController', jqController);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jqController.$inject = ['$scope', '$q', '$rootScope', 'TableActService', 'ExecuteService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jqController($scope, $q, $rootScope, TableActService, ExecuteService) {
    $scope.invalidInputFiles = [];
    $scope.modelOptionsInput = {};
    $scope.multipleInput = true;
    $scope.patternInput = '.csv,.xlsx';
    $scope.acceptSelectInput = '.csv,.xlsx';
    $scope.options = JSON.parse($scope.jqGridConfig);

    $scope.filterItems = filterItems;
    $scope.filterName = filterName;
    $scope.uploadFile = uploadFile;
    $scope.validateInput = validateInput;

    // Check status of the last validate execution
    if ($scope.options.inputValidation) {
      ExecuteService.getHistory($scope.options.pid, 'input_validation', 1)
        .then(function (runHistory) {
          runHistory.forEach(function (data) {
            if (data.status.toLowerCase() === $scope.options.execStatus.queued || data.status.toLowerCase() === $scope.options.execStatus.running) {
              var currentTab;
              validateInput($rootScope.$emit('validationClick'), $scope.jqGridTableNames, data.jobId);
            }
          });
        });
    }

    function filterItems (userInput, dropdownItems) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = dropdownItems.filter(function(item) {
        if (!angular.isUndefined(item)) {
          return (_.isString(item) ? item.toLowerCase() : item.toString().toLowerCase()).indexOf(normalisedInput) === 0;
        }
      });

      filter.resolve(filteredArray);
      return filter.promise;
    }

    function filterName (name) {
      return name.replace(/\s+/g, '_');
    }

    // upload new file to the current table
    function uploadFile (ev, file, table) {
      if (file) {
        TableActService.uploadFile(ev, file, table, $scope.options.pid, $scope.options.type)
          .then(function (result) {
            $scope.inputFiles = [];
            if ($scope.options.inputValidation) {
              validateInput($rootScope.$emit('validationClick'), table);
            }
            if (result) {
              table.file_name = result.file_name;
              table.updated_by = result.updated_by;
              table.updated_at = result.updated_at;
              table.status = result.status;
            }
          });
      }
    }

    function validateInput(ev, input, jobId) {
      if ($scope.options.inputValidation) {
        TableActService.validateInput(ev, input, jobId, $scope.options.inputValidation, $scope.options.pid);
      }
    }
  }
})();

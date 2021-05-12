(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('jqGridWidget')
    .directive('fieldForm', fieldForm);
  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  fieldForm.$inject = ['$q', '$rootScope'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function fieldForm ($q, $rootScope) {
    var directive = {
      restrict: 'E',
      templateUrl: 'jqGridWidget/widget/views/field_types.ejs', // markup for template
      scope: {
        tabType: '@',
        model: '=',
        columnUrl: '@'
      },
      link: link
    };
    return directive;

    function link (scope, element, attrs) {
      scope.$watch('model', function (newVal, oldVal) {
        if (newVal) {
          scope.getColumnUrl = scope.columnUrl + scope.model.id;
          scope.parentColumnValue = scope.model.parentColumnValue ? ('&parentColumnValue=' + scope.model.parentColumnValue) : '';
        }
      });

      // Change the dropdown list after editing field
      scope.filterItems = function (userInput, dropdownItems) {
        var filter = $q.defer();
        var normalisedInput = userInput.toLowerCase();
        var filteredArray = dropdownItems.filter(function(item) {
          if (!angular.isUndefined(item)) {
            return (_.isString(item) ? item.toLowerCase() : item.toString().toLowerCase()).indexOf(normalisedInput) === 0;
          }
        });

        filter.resolve(filteredArray);
        return filter.promise;
      };

      scope.selectItem = function (item) {
        $rootScope.$emit('changeDropdownValue', {value: item, columnName: scope.model.id});
      };

      if (scope.model.parentColumnName) {
        $rootScope.$on('changeDropdownValue', function (ev, result) {
          if (scope.model.parentColumnName == result.columnName) {
            scope.parentColumnValue = '&parentColumnValue=' + result.value;
            scope.model.rowValue = '';
          }
        });
      }

    }
  }

})();

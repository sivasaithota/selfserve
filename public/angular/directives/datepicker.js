(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('datepickerOpex', datepickerOpex);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  datepickerOpex.$inject = ['ParameterService', '$timeout', '$filter'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function datepickerOpex(ParameterService, $timeout, $filter) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'A',
      // link option registers DOM listeners as well as updates the DOM
      link: link,
      // bind data to the directive's scope
      scope: {
        datepickerOpex: '=',
        parameter: '=',
        pid: '='
      }
    };

    return directive;

    function link(scope, element, attrs, ngModelCtrl) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
      // and their corresponding attribute values
      if (scope.datepickerOpex || (scope.datepickerOpex && scope.datepickerOpex !== 'null')) {
        scope.datepickerOpex = new Date(scope.datepickerOpex);
      } else {
        scope.datepickerOpex = null;
      }

      element.find("input").datetimepicker({
          format: 'MM/DD/YYYY',
          date: scope.datepickerOpex
        })
        .on('dp.change', function (ev) {
          if (ev && ev.date) {
            ev.date._d = ev.date._d.toString();
            scope.datepickerOpex = ev.date._d.substring(0, ev.date._d.indexOf(' GMT'));
          } else {
            scope.datepickerOpex = null;
          }
          scope.$apply();
          if (scope.parameter && scope.pid) {
            var parameter = Object.assign(scope.parameter, {
              value: $filter('date')(new Date(scope.parameter.value), 'MM/dd/yyyy')
            });
            ParameterService.saveParameter(scope.pid, parameter)
              .then(function () {
                scope.parameter.isSaved = true;
                $timeout(function (argument) {
                  scope.parameter.isSaved = false;
                }, 3000);
              });
          }
        });
      element.find("i").bind("click", function (event) {
        element.find("input").focus();
      });
    }
  }
})();

(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('dateTimePicker', dateTimePicker);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  dateTimePicker.$inject = ['$timeout'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function dateTimePicker ($timeout) {
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
        dateTimePicker: '='
      }
    };

    return directive;

    function link (scope, element, attrs, ngModelCtrl) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
        // and their corresponding attribute values
      element.find("input").datetimepicker({
        format: 'MM/DD/YYYY HH:mm:ss',
        date: scope.dateTimePicker ? new Date(scope.dateTimePicker) : ''
      })
      .on('dp.change', function(ev) {
        if (ev.oldDate) {
          scope.dateTimePicker = ev && ev.date ? new Date(ev.date._d) : null;
          scope.$apply();
        }
      });
      element.find("i").bind("click", function(event) {
        element.find("input").focus();
      });
    }
  }
})();

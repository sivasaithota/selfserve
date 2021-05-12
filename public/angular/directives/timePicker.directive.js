(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('timePicker', timePicker);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  timePicker.$inject = ['$timeout', '$filter'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function timePicker ($timeout, $filter) {
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
        timePicker: '='
      }
    };

    return directive;

    function link (scope, element, attrs, ngModelCtrl) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
        // and their corresponding attribute values
      var pickerValue = scope.timePicker ? new Date('1970-01-01T' + scope.timePicker) : '';
      element.find("input").datetimepicker({
        format: 'LT',
        date: pickerValue
      })
      .on('dp.change', function(ev) {
        scope.timePicker = ev && ev.date ? $filter('date')(ev.date._d, 'HH:mm:ss') : null;
        scope.$apply();
      });
      element.find("i").bind("click", function(event) {
        element.find("input").focus();
      });
    }
  }
})();

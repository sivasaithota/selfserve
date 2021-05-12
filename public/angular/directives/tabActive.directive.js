(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('mdActiveNc', mdActiveNc);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  mdActiveNc.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function mdActiveNc () {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'A',
      require: '^?mdTabs',
      // link option registers DOM listeners as well as updates the DOM
      link: link
    };

    return directive;

    function link(scope, element, attrs, ctrl) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names 
        // and their corresponding attribute values
      var index = ctrl.getTabElementIndex(element);
      scope.$watch(attrs.mdActiveNc, function (active) {
        if (active) {
          ctrl.focusIndex = ctrl.selectedIndex = index;
          ctrl.lastClick = true;
        }
      });
    }
  }
})();
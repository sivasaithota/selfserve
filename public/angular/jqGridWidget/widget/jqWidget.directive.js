(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('jqGridWidget')
    .directive('jqWidget', jqWidget);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  jqWidget.$inject = ['$templateCache', '$compile'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function jqWidget ($templateCache, $compile) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'EA',
      controller: 'jqWidController',
        // bind data to the directive's scope
      scope: {
        widgetInfo: '=ngModel'
      },
      // templateUrl specifies the HTML markup that will be produced
      // when the directive is compiled and linked by Angular
      templateUrl: 'jqGridWidget/widget/index.ejs'
    };

    return directive;

  }
})();

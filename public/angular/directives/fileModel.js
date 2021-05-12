(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('fileModel', fileModel);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  fileModel.$inject = ['$parse', '$rootScope'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function fileModel ($parse, $rootScope) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'A',
      // link option registers DOM listeners as well as updates the DOM
      link: link
    };

    return directive;

    function link (scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names 
        // and their corresponding attribute values
      var model = $parse(attrs.fileModel);
     
      var modelSetter = model.assign;
      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files);
          // sending an event through the application scope
          $rootScope.$broadcast('modelChanged');
        });
      });
    };
  }
})();
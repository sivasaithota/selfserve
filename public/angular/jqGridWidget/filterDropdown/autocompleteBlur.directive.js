(function() {
  'use strict';

    // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
    angular
      .module('jqGridWidget')
      .directive('autocompleteBlur', autocompleteBlur);

    // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
    autocompleteBlur.$inject = ['$timeout'];

    // Update model after unfocus dropdown
    function autocompleteBlur($timeout) {
      return {
        link: function(scope, element, attrs){
          $timeout(clearInputBoxOnBlur, 0);

          function clearInputBoxOnBlur(){
            element.find("input").blur(function(){
              scope.filter.page = 1;
              scope.filter.records = [];
            });
          }
        }
      }
    }
})();

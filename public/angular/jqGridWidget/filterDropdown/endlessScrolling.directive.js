(function() {
  'use strict';

    // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
    angular
      .module('jqGridWidget')
      .directive('whenscrollends', whenscrollends);

    // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
    whenscrollends.$inject = ['$timeout'];

    // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
    function whenscrollends($timeout) {
      return {
        restrict: "A",
        link: function(scope, element, attrs) {
          var input = element.find('input');
          var findInput = function() {
            $timeout(function () {
              input = element.find('input');
              if(input.length == 0) {
                findInput();
              } else {
                input.addClass('autoCompleteArrow');
              }
            }, 100);
          };

          var mdRepeatContainer = element.find('md-virtual-repeat-container');
          var container = element[0].querySelector('.md-virtual-repeat-scroller');
          var mdAutoCompleteSuggestions = element[0].querySelector('.md-autocomplete-suggestions');

          var threshold = 0;

          angular.element(container).on('scroll',function(e) {
            var scrollableHeight = e.target.scrollHeight;
            var hidden = scrollableHeight - mdRepeatContainer[0].scrollHeight;
            if(hidden - container.scrollTop <= 100) {
              scope.$apply(attrs.whenscrollends);
            }
          });
         if (input.length == 0) findInput();
        }
      }
    }
})();

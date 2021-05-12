(function() {
  'use strict';

  angular
    .module('commonApp')
    .directive('mdHideAutocompleteOnEnter', mdHideAutocompleteOnEnter);
	  
  function mdHideAutocompleteOnEnter() {
    return {
      restrict: 'A',
      require: 'mdAutocomplete',
      link: function(scope, element) {
        element.on('keydown keypress', function($event) {
        // 13: Enter
        if ($event.keyCode === 13) {
          var eAcInput = this.getElementsByTagName('input')[0];
          eAcInput.blur();
          if (scope.$parent &&
            scope.$parent.$parent &&
            scope.$parent.$parent.filteringColumns &&
            scope.$parent.$parent.quickFilter) {
            scope.$parent.$parent.quickFilter(scope.$parent.$parent.filteringColumns);
          }
        }
        });
      }
    };
  }
})();

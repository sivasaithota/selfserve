(function() {
  'use strict';

  angular
    .module('commonApp')
    .directive('spinner', spinner);

  function spinner () {
    return {
      restrict: 'AE',
      replace: 'false',
      templateUrl: 'includes/spinner.ejs'
    };
  }
})();
